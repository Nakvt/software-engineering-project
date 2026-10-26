import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useGeofencing, SupportedLanguage } from '../hooks/useGeofencing';
import { POI, MultiLangString } from '../../domain/models/POI';
import { Tour } from '../../domain/models/Tour';
import { MOCK_TOURS } from '../../domain/models/mockTour';
import { TopBar } from '../components/TopBar';
import { MiniPlayer } from '../components/MiniPlayer';
import { AudioLib } from '../../libs/audio';

const MOCK_TITLE_MAP: Record<SupportedLanguage, string> = {
  vi: 'Mô phỏng vị trí GPS:',
  en: 'GPS Location Simulation:',
  ja: 'GPS位置シミュレーション:',
  zh: 'GPS位置模拟:',
  ko: 'GPS 위치 시뮬레이션:',
};

const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ko: 'ko-KR',
};

function getTranslationName(
  name?: string | MultiLangString,
  lang: SupportedLanguage = 'vi'
): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang] || name.vi || '';
}

export const MapScreen: React.FC<any> = ({ navigation, route }) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('vi');
  const { activePOI, hasPermission, simulateLocation, pois } = useGeofencing([], selectedLang);
  const webViewRef = useRef<WebView>(null);

  // Hàm phát/đọc lại thuyết minh cho POI hiện tại
  const handleReplayAudio = () => {
    if (!activePOI) return;

    const ttsScript =
      typeof activePOI.audio?.ttsScript === 'string'
        ? activePOI.audio.ttsScript
        : activePOI.audio?.ttsScript?.[selectedLang] || activePOI.audio?.ttsScript?.vi;

    if (ttsScript) {
      const locale = LANGUAGE_LOCALE_MAP[selectedLang] || 'vi-VN';
      console.log(`🔄 [Replay TTS ${selectedLang}]: ${ttsScript}`);
      AudioLib.playTTS(ttsScript, locale);
    } else if (activePOI.audio?.audioUrl) {
      AudioLib.playAudio(activePOI.audio.audioUrl);
    }
  };

  const selectedTourId = route?.params?.selectedTourId;
  const activeTour = useMemo(
    () => MOCK_TOURS.find((t: Tour) => t.id === selectedTourId),
    [selectedTourId]
  );

  const tourPOIs = useMemo(() => {
    if (!activeTour) return [];
    return activeTour.poiIds
      .map((id: string) => pois.find((poi: POI) => poi.id === id))
      .filter((poi): poi is POI => poi !== undefined);
  }, [activeTour, pois]);

  const htmlContent = useMemo(() => {
    const formattedPois = pois.map((poi) => ({
      ...poi,
      displayName: getTranslationName(poi.name, selectedLang),
    }));

    const poisJson = JSON.stringify(formattedPois);
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

          pois.forEach(function(poi) {
            var marker = L.marker([poi.location.lat, poi.location.lng]).addTo(map);
            marker.bindPopup("<b>" + poi.displayName + "</b><br>Bán kính: " + poi.radius + "m");

            L.circle([poi.location.lat, poi.location.lng], {
              color: '#007AFF',
              fillColor: '#007AFF',
              fillOpacity: 0.15,
              radius: poi.radius
            }).addTo(map);
          });

          if (tourPois.length > 1) {
            var latlngs = tourPois.map(function(p) { return [p.location.lat, p.location.lng]; });
            var polyline = L.polyline(latlngs, { color: '#007AFF', weight: 4 }).addTo(map);
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          }
        </script>
      </body>
      </html>
    `;
  }, [pois, tourPOIs, selectedLang]);

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
      {/* 1. TopBar */}
      <TopBar
        currentLanguage={selectedLang}
        onSelectLanguage={(lang) => setSelectedLang(lang)}
        onPressScanQR={() => navigation.navigate('QRScanner')}
      />

      {/* 2. Tour Banner */}
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

      {/* 3. Bản đồ Leaflet */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {/* 4. Mô phỏng vị trí GPS */}
      <View style={styles.mockControls}>
        <Text style={styles.mockLabel}>{MOCK_TITLE_MAP[selectedLang]}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mockButtonsRow}>
          {pois.map((poi) => {
            const displayName = getTranslationName(poi.name, selectedLang);
            return (
              <TouchableOpacity
                key={poi.id}
                style={styles.mockButton}
                onPress={() => simulateLocation(poi.location)}
              >
                <Text style={styles.mockButtonText}>{displayName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. MiniPlayer */}
      <MiniPlayer
        poi={activePOI}
        distanceMeters={15}
        isPlaying={true}
        selectedLanguage={selectedLang}
        onPressCard={() => {
          if (activePOI) {
            navigation.navigate('AudioPlayer', { poi: activePOI, selectedLanguage: selectedLang });
          }
        }}
        onPressSelectTour={() => navigation.navigate('Tours')}
        onPressReplay={handleReplayAudio}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  warningText: { fontSize: 16, textAlign: 'center', color: '#d9534f' },
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
  },
  tourBannerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  tourBannerText: { fontSize: 13, fontWeight: 'bold', color: '#1c1c1e', marginLeft: 8, flex: 1 },
  cancelTourBtn: { padding: 4 },
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
  },
  mockLabel: { fontSize: 11, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  mockButtonsRow: { flexDirection: 'row', gap: 8 },
  mockButton: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  mockButtonText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});