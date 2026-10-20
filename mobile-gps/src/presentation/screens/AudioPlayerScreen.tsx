import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { POI, MultiLangString } from '../../domain/models/POI';

/**
 * Helper trích xuất văn bản an toàn tránh lỗi Render Error
 */
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

  if (!poi) {
    return (
      <View style={styles.centerContainer}>
        <Text>Không tìm thấy thông tin di tích.</Text>
      </View>
    );
  }

  // Lấy tên và kịch bản thuyết minh dạng string an toàn
  const poiName = getTranslationText(poi.name, selectedLanguage);
  const poiDescription = getTranslationText(poi.description, selectedLanguage);
  const ttsScript = getTranslationText(poi.audio?.ttsScript, selectedLanguage);

  return (
    <SafeAreaView style={styles.container}>
      {/* Nút Back quay lại bản đồ */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Ảnh đại diện POI lớn */}
      <Image
        source={{
          uri:
            poi.imageUrl ||
            'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600',
        }}
        style={styles.coverImage}
        resizeMode="cover"
      />

      {/* Thông tin chi tiết di tích */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{poiName}</Text>
        {poiDescription ? <Text style={styles.description}>{poiDescription}</Text> : null}
        
        {/* Kịch bản thuyết minh */}
        <View style={styles.scriptBox}>
          <Text style={styles.scriptLabel}>Nội dung thuyết minh ({selectedLanguage.toUpperCase()}):</Text>
          <Text style={styles.scriptText}>
            {ttsScript || 'Chưa có kịch bản thuyết minh cho ngôn ngữ này.'}
          </Text>
        </View>
      </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  coverImage: { width: '100%', height: 300 },
  infoContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1c1c1e', marginBottom: 8 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },
  scriptBox: { backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF' },
  scriptLabel: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', marginBottom: 6 },
  scriptText: { fontSize: 14, color: '#333', lineHeight: 22 },
});