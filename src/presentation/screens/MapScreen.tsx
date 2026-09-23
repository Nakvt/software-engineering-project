import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Circle, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useGeofencing } from '../hooks/useGeofencing';
import { MOCK_POIS } from '../../domain/models/mockPOI';
import { MOCK_TOURS } from '../../domain/models/mockTour';
import { TopBar } from '../components/TopBar';
import { MiniPlayer } from '../components/MiniPlayer';

export const MapScreen: React.FC<any> = ({ navigation, route }) => {
  const { activePOI, hasPermission, simulateLocation } = useGeofencing(MOCK_POIS, 'vi-VN');

  // Lấy tourId nếu người dùng chuyển từ màn hình Tours sang
  const selectedTourId = route?.params?.selectedTourId;
  const activeTour = useMemo(
    () => MOCK_TOURS.find((t) => t.id === selectedTourId),
    [selectedTourId]
  );

  // Lọc và sắp xếp các POI thuộc Tour đang chọn theo đúng thứ tự lộ trình
  const tourPOIs = useMemo(() => {
    if (!activeTour) return [];
    return activeTour.poiIds
      .map((id) => MOCK_POIS.find((poi) => poi.id === id))
      .filter((poi): poi is typeof MOCK_POIS[0] => poi !== undefined);
  }, [activeTour]);

  // Tạo danh sách tọa độ để vẽ đường Polyline nối các điểm
  const polylineCoordinates = useMemo(() => {
    return tourPOIs.map((poi) => ({
      latitude: poi.location.lat,
      longitude: poi.location.lng,
    }));
  }, [tourPOIs]);

  const initialRegion = {
    latitude: 16.099123,
    longitude: 108.277456,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.warningText}>
          Vui lòng cấp quyền vị trí GPS để sử dụng tính năng thuyết minh tự động.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Top Bar */}
      <TopBar
        onPressLanguage={() => console.log('Đổi ngôn ngữ')}
        onPressScanQR={() => navigation.navigate('QRScanner')}
        onSearchChange={(text) => console.log('Tìm kiếm:', text)}
      />

      {/* 2. Thanh hiển thị Tour đang kích hoạt */}
      {activeTour && (
        <View style={styles.tourBanner}>
          <View style={styles.tourBannerInfo}>
            <Ionicons name="navigate-circle" size={20} color="#007AFF" />
            <Text style={styles.tourBannerText} numberOfLines={1}>
              Lộ trình: {activeTour.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cancelTourBtn}
            onPress={() => navigation.setParams({ selectedTourId: undefined })}
          >
            <Ionicons name="close-circle" size={18} color="#8e8e93" />
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Bản đồ */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {/* Đường nối giữa các điểm trong Tour */}
        {polylineCoordinates.length > 1 && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {/* Danh sách Markers */}
        {MOCK_POIS.map((poi) => {
          // Kiểm tra xem POI có nằm trong tour đang chọn không
          const tourStepIndex = activeTour ? activeTour.poiIds.indexOf(poi.id) : -1;
          const isPartOfTour = tourStepIndex !== -1;

          return (
            <React.Fragment key={poi.id}>
              <Marker
                coordinate={{
                  latitude: poi.location.lat,
                  longitude: poi.location.lng,
                }}
                title={isPartOfTour ? `[Điểm ${tourStepIndex + 1}] ${poi.name}` : poi.name}
                description={`Bán kính: ${poi.radius}m`}
                pinColor={activePOI?.id === poi.id ? 'green' : isPartOfTour ? 'indigo' : 'red'}
              />
              <Circle
                center={{
                  latitude: poi.location.lat,
                  longitude: poi.location.lng,
                }}
                radius={poi.radius}
                strokeColor={
                  isPartOfTour ? 'rgba(0, 122, 255, 0.8)' : 'rgba(255, 99, 71, 0.6)'
                }
                fillColor={
                  isPartOfTour ? 'rgba(0, 122, 255, 0.2)' : 'rgba(255, 99, 71, 0.15)'
                }
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* 4. Thanh nút bấm mô phỏng vị trí GPS */}
      <View style={styles.mockControls}>
        <Text style={styles.mockLabel}>Mô phỏng vị trí GPS:</Text>
        <View style={styles.mockButtonsRow}>
          {MOCK_POIS.map((poi, index) => (
            <TouchableOpacity
              key={poi.id}
              style={styles.mockButton}
              onPress={() => {
                simulateLocation({
                  lat: poi.location.lat,
                  lng: poi.location.lng,
                });
              }}
            >
              <Text style={styles.mockButtonText}>Đến Điểm {index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. Mini Player nổi ở đáy */}
      <MiniPlayer
        poi={activePOI}
        distanceMeters={15}
        isPlaying={true}
        onPressCard={() => {
          if (activePOI) {
            navigation.navigate('AudioPlayer', { poi: activePOI });
          }
        }}
        onPressSelectTour={() => navigation.navigate('Tours')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  warningText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#d9534f',
  },
  tourBanner: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tourBannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tourBannerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginLeft: 8,
    flex: 1,
  },
  cancelTourBtn: {
    padding: 4,
  },
  mockControls: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mockLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  mockButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mockButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  mockButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});