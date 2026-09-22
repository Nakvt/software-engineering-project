import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { useGeofencing } from '../hooks/useGeofencing';
import { MOCK_POIS } from '../../domain/models/mockPOI';
import { TopBar } from '../components/TopBar';
import { MiniPlayer } from '../components/MiniPlayer';

// Nhận prop navigation từ React Navigation
export const MapScreen: React.FC<any> = ({ navigation }) => {
  const { activePOI, hasPermission, simulateLocation } =
    useGeofencing(MOCK_POIS, 'vi-VN');

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

      {/* 2. Bản đồ */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {MOCK_POIS.map((poi) => (
          <React.Fragment key={poi.id}>
            <Marker
              coordinate={{
                latitude: poi.location.lat,
                longitude: poi.location.lng,
              }}
              title={poi.name}
              description={`Bán kính: ${poi.radius}m`}
              pinColor={activePOI?.id === poi.id ? 'green' : 'red'}
            />
            <Circle
              center={{
                latitude: poi.location.lat,
                longitude: poi.location.lng,
              }}
              radius={poi.radius}
              strokeColor="rgba(255, 99, 71, 0.6)"
              fillColor="rgba(255, 99, 71, 0.15)"
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* 3. Thanh nút bấm mô phỏng: Đẩy lên cao hơn để không che MiniPlayer và Bottom Tab */}
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

      {/* 4. Mini Player nổi ở đáy: Nằm ngay trên Bottom Tab Bar */}
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
  mockControls: {
    position: 'absolute',
    // Đẩy lên vị trí cách đáy 110px để nhường chỗ cho MiniPlayer
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