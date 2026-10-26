import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
// Sửa Warning: Dùng SafeAreaView từ react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { POI, MultiLangString } from '../../domain/models/POI';
import { AudioLib, RegionAccent } from '../../libs/audio';

const REGION_OPTIONS: { id: RegionAccent; label: string }[] = [
  { id: 'north', label: 'Bắc' },
  { id: 'central', label: 'Trung' },
  { id: 'south', label: 'Nam' },
];

function getTranslationText(
  value?: string | MultiLangString,
  lang: string = 'vi'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang as keyof MultiLangString] || value.vi || '';
}

export const AudioPlayerScreen: React.FC<any> = ({ route, navigation }) => {
  const poi: POI = route?.params?.poi;
  const selectedLanguage: string = route?.params?.selectedLanguage || 'vi';

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionAccent>('north');

  if (!poi) {
    return (
      <View style={styles.centerContainer}>
        <Text>Không tìm thấy thông tin di tích.</Text>
      </View>
    );
  }

  const poiName = getTranslationText(poi.name, selectedLanguage);
  const poiDescription = getTranslationText(poi.description, selectedLanguage);
  const ttsScript = getTranslationText(poi.audio?.ttsScript, selectedLanguage);

  const handleTogglePlay = () => {
    if (isPlaying) {
      AudioLib.stop();
      setIsPlaying(false);
    } else {
      if (ttsScript) {
        const localeMap: Record<string, string> = {
          vi: 'vi-VN',
          en: 'en-US',
          ja: 'ja-JP',
          zh: 'zh-CN',
          ko: 'ko-KR',
        };

        AudioLib.playTTS(
          ttsScript,
          localeMap[selectedLanguage] || 'vi-VN',
          () => setIsPlaying(false)
        );
        setIsPlaying(true);
      }
    }
  };

  const handleChangeRegion = async (region: RegionAccent) => {
    setSelectedRegion(region);
    await AudioLib.setVietnameseRegionalVoice(region);

    if (isPlaying) {
      await AudioLib.stop();
      setIsPlaying(false);
      setTimeout(() => {
        handleTogglePlay();
      }, 200);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Nút Back quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ảnh đại diện POI */}
        <Image
          source={{
            uri:
              poi.imageUrl ||
              'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600',
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        {/* Thông tin di tích */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{poiName}</Text>
          {poiDescription ? <Text style={styles.description}>{poiDescription}</Text> : null}

          {/* Bộ chọn giọng đọc 3 Miền (Căn chỉnh UI đều đặn không bị lồi) */}
          {selectedLanguage === 'vi' && (
            <View style={styles.regionContainer}>
              <Text style={styles.regionLabel}>Giọng miền:</Text>
              <View style={styles.regionRow}>
                {REGION_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.regionBtn,
                      selectedRegion === item.id && styles.regionBtnActive,
                    ]}
                    onPress={() => handleChangeRegion(item.id)}
                  >
                    <Text
                      style={[
                        styles.regionText,
                        selectedRegion === item.id && styles.regionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Nút Play / Pause */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.playButton} onPress={handleTogglePlay}>
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={72}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>

          {/* Nội dung kịch bản văn bản */}
          <View style={styles.scriptBox}>
            <Text style={styles.scriptLabel}>
              Nội dung thuyết minh ({selectedLanguage.toUpperCase()}):
            </Text>
            <Text style={styles.scriptText}>
              {ttsScript || 'Chưa có kịch bản thuyết minh cho ngôn ngữ này.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  coverImage: { width: '100%', height: 260 },
  infoContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1c1c1e', marginBottom: 8 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },

  // Căn chỉnh khối chọn miền cân đối, thụt lùi đều 2 bên
  regionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  regionLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  regionRow: { flexDirection: 'row', gap: 6 },
  regionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E9ECEF',
    minWidth: 55,
    alignItems: 'center',
  },
  regionBtnActive: { backgroundColor: '#007AFF' },
  regionText: { fontSize: 12, fontWeight: 'bold', color: '#495057' },
  regionTextActive: { color: '#ffffff' },

  controls: { alignItems: 'center', marginVertical: 10 },
  playButton: { padding: 2 },

  scriptBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginTop: 10,
  },
  scriptLabel: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', marginBottom: 6 },
  scriptText: { fontSize: 14, color: '#333', lineHeight: 22 },
});