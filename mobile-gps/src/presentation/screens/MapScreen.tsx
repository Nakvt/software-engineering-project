import React, { useMemo, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useGeofencing } from '../hooks/useGeofencing';
import { POI } from '../../domain/models/POI';
import { Tour } from '../../domain/models/Tour';
import { MOCK_POIS } from '../../domain/models/mockPOI';
import { MOCK_TOURS } from '../../domain/models/mockTour';
import { TopBar } from '../components/TopBar';
import { MiniPlayer } from '../components/MiniPlayer';

export const MapScreen: React.FC<any> = ({ navigation, route }) => {
  const { activePOI, hasPermission, simulateLocation } = useGeofencing(MOCK_POIS, 'vi-VN');
  const webViewRef = useRef<WebView>(null);

  const selectedTourId = route?.params?.selectedTourId;
  const activeTour = useMemo(
    () => MOCK_TOURS.find((t: Tour) => t.id === selectedTourId),
    [selectedTourId]
  );

  const tourPOIs = useMemo(() => {
    if (!activeTour) return [];
    return activeTour.poiIds
      .map((id: string) => MOCK_POIS.find((poi: POI) => poi.id === id))
      .filter((poi): poi is POI => poi !== undefined);
  }, [activeTour]);

  // Tạo HTML chứa bản đồ Leaflet + OpenStreetMap hoàn chỉnh không cần API Key
  const htmlContent = useMemo(() => {
    const poisJson = JSON.stringify(MOCK_POIS);
    const tourPoisJson = JSON.stringify(tourPOIs);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([16.099123, 108.277456], 17);
          
          L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap France'
          }).addTo(map);

          var pois = ${poisJson};
          var tourPois = ${tourPoisJson};

          // Vẽ Markers & Circles
          pois.forEach(function(poi, index) {
            var marker = L.marker([poi.location.lat, poi.location.lng]).addTo(map);
            marker.bindPopup("<b>" + poi.name + "</b><br>Bán kính: " + poi.radius + "m");
            
            L.circle([poi.location.lat, poi.location.lng], {
              color: '#007AFF',
              fillColor: '#007AFF',
              fillOpacity: 0.15,
              radius: poi.radius
            }).addTo(map);
          });

          // Vẽ đường Tour Polyline nếu có
          if (tourPois.length > 1) {
            var latlngs = tourPois.map(function(p) { return [p.location.lat, p.location.lng]; });
            var polyline = L.polyline(latlngs, { color: '#007AFF', weight: 4 }).addTo(map);
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          }
        </script>
      </body>
      </html>
    `;
  }, [tourPOIs]);

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

      {/* 2. Banner hiển thị khi có Tour */}
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

      {/* 3. Bản đồ hiển thị qua Leaflet OpenStreetMap */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {/* 4. Thanh nút bấm mô phỏng vị trí GPS */}
      <View style={styles.mockControls}>
        <Text style={styles.mockLabel}>Mô phỏng vị trí GPS:</Text>
        <View style={styles.mockButtonsRow}>
          {MOCK_POIS.map((poi: POI, index: number) => (
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
    zIndex: 10,
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