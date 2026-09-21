import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { useGeofencing } from '../hooks/useGeofencing';
import { MOCK_POIS } from '../../domain/models/mockPOI';
import { AudioLib } from '../../libs/audio';

export const MapScreen: React.FC = () => {
  // Đổi setCurrentLocation thành simulateLocation
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
              strokeColor="rgba(0, 150, 255, 0.5)"
              fillColor="rgba(0, 150, 255, 0.15)"
            />
          </React.Fragment>
        ))}
      </MapView>

      {activePOI && (
        <View style={styles.activePoiCard}>
          <Text style={styles.poiTitle}>🎧 Đang phát: {activePOI.name}</Text>
          <Text style={styles.poiScript} numberOfLines={2}>
            {activePOI.audio?.ttsScript}
          </Text>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => AudioLib.stopAll()}
          >
            <Text style={styles.buttonText}>Dừng âm thanh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Thanh công cụ Mock Test */}
      <View style={styles.mockControls}>
        <Text style={styles.mockLabel}>Mô phỏng di chuyển:</Text>
        <View style={styles.mockButtonsRow}>
          {MOCK_POIS.map((poi, index) => (
            <TouchableOpacity
              key={poi.id}
              style={styles.mockButton}
              onPress={() => {
                // Gọi hàm simulateLocation để lập tức kích hoạt Geofence & Audio
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  activePoiCard: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
  },
  poiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b2b2b',
    marginBottom: 4,
  },
  poiScript: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mockControls: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 10,
    elevation: 4,
  },
  mockLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  mockButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mockButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  mockButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});