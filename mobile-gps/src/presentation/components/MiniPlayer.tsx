import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { POI, MultiLangString } from '../../domain/models/POI';

interface MiniPlayerProps {
  poi: POI | null;
  distanceMeters?: number;
  isPlaying?: boolean;
  selectedLanguage?: string;
  onPressCard?: () => void;
  onPressSelectTour?: () => void;
  onPressReplay?: () => void; // Thêm callback kích hoạt phát lại audio
}

/**
 * Hàm hỗ trợ trích xuất tên di tích an toàn dạng string theo ngôn ngữ
 */
function getDisplayName(name?: string | MultiLangString, lang: string = 'vi'): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang as keyof MultiLangString] || name.vi || '';
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  poi,
  distanceMeters = 15,
  isPlaying = true,
  selectedLanguage = 'vi',
  onPressCard,
  onPressSelectTour,
  onPressReplay,
}) => {
  if (!poi) return null;

  // Trích xuất tên di tích dạng string an toàn 100%
  const poiName = getDisplayName(poi.name, selectedLanguage);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={onPressCard}
    >
      {/* 1. Ảnh đại diện POI */}
      <Image
        source={{
          uri:
            poi.imageUrl ||
            'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=300',
        }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* 2. Thông tin tên POI và khoảng cách */}
      <View style={styles.infoContainer}>
        <Text style={styles.badge}>POI</Text>
        <Text style={styles.title} numberOfLines={1}>
          Near: {poiName} ({Math.round(distanceMeters)}m)
        </Text>

        {/* Trạng thái Auto-Playing */}
        <View style={styles.statusRow}>
          <Ionicons
            name={isPlaying ? 'play' : 'pause'}
            size={12}
            color="#27ae60"
          />
          <Text style={styles.statusText}>
            {isPlaying ? 'Auto-Playing' : 'Paused'}
          </Text>
        </View>
      </View>

      {/* 3. Nút Đọc Lại (Replay Audio) */}
      <TouchableOpacity
        style={styles.replayButton}
        onPress={onPressReplay}
      >
        <Ionicons name="refresh-circle" size={32} color="#007AFF" />
      </TouchableOpacity>

      {/* 4. Nút Chọn Tour */}
      <TouchableOpacity
        style={styles.tourButton}
        onPress={onPressSelectTour}
      >
        <Text style={styles.tourButtonText}>Chọn Tour</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#eaeaea',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginTop: 2,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
    marginLeft: 4,
  },
  replayButton: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 6,
  },
  tourButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});