import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Accent } from '../../domain/models/POI';
import { AudioLib } from '../../libs/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'AudioPlayer'>;

export const AudioPlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { poi } = route.params;
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedAccent, setSelectedAccent] = useState<Accent>('north');

  const togglePlayback = () => {
    if (isPlaying) {
      AudioLib.stopAll();
      setIsPlaying(false);
    } else {
      if (poi.audio?.ttsScript) {
        AudioLib.playTTS(poi.audio.ttsScript, 'vi-VN');
      } else if (poi.audio?.audioUrl) {
        AudioLib.playAudio(poi.audio.audioUrl);
      }
      setIsPlaying(true);
    }
  };

  const handleChangeAccent = (accent: Accent) => {
    setSelectedAccent(accent);
    // Chuẩn bị kết nối API lấy audio/TTS theo vùng miền
    console.log(`Đã đổi sang giọng: ${accent}`);
  };

  return (
    <View style={styles.container}>
      {/* 1. Nút Back góc trên */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#1c1c1e" />
      </TouchableOpacity>

      {/* 2. Ảnh lớn của POI */}
      <Image
        source={{
          uri:
            poi.imageUrl ||
            'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800',
        }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* 3. Tiêu đề và thông tin vùng */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{poi.name}</Text>
        <Text style={styles.subtitle}>Bán kính kích hoạt • {poi.radius}m</Text>

        {/* 4. Thanh tiến trình âm thanh (Progress Bar) */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '40%' }]} />
            <View style={styles.progressKnob} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>01:15</Text>
            <Text style={styles.timeText}>
              {poi.audio?.duration ? `0${Math.floor(poi.audio.duration / 60)}:${poi.audio.duration % 60}` : '03:30'}
            </Text>
          </View>
        </View>

        {/* 5. Cụm nút điều khiển phát thanh */}
        <View style={styles.controlsRow}>
          <TouchableOpacity>
            <Ionicons name="shuffle" size={22} color="#8e8e93" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="play-skip-back" size={28} color="#1c1c1e" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayback}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#ffffff"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="play-skip-forward" size={28} color="#1c1c1e" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="repeat" size={22} color="#8e8e93" />
          </TouchableOpacity>
        </View>

        {/* 6. Bộ chọn vùng miền (Dialect/Accent) */}
        <View style={styles.dialectSection}>
          <Text style={styles.dialectLabel}>Dialect</Text>
          <View style={styles.dialectButtonGroup}>
            {(['north', 'central', 'south'] as Accent[]).map((accent) => {
              const labelMap: Record<Accent, string> = {
                north: 'Bắc',
                central: 'Trung',
                south: 'Nam',
              };
              const isSelected = selectedAccent === accent;
              return (
                <TouchableOpacity
                  key={accent}
                  style={[
                    styles.dialectBtn,
                    isSelected && styles.dialectBtnActive,
                  ]}
                  onPress={() => handleChangeAccent(accent)}
                >
                  <Text
                    style={[
                      styles.dialectBtnText,
                      isSelected && styles.dialectBtnTextActive,
                    ]}
                  >
                    [ {labelMap[accent]} ]
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 6,
  },
  heroImage: {
    width: '100%',
    height: '42%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  subtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#e5e5ea',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
    position: 'absolute',
    left: '39%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#8e8e93',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#007AFF',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  dialectSection: {
    marginTop: 10,
  },
  dialectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 10,
  },
  dialectButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dialectBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d1d6',
    alignItems: 'center',
  },
  dialectBtnActive: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  dialectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
  },
  dialectBtnTextActive: {
    color: '#007AFF',
  },
});