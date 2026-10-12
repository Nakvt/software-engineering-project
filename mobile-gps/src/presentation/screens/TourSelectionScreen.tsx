import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Tour } from '../../domain/models/Tour';
import { tourService } from '../../domain/services/tourService';

interface Props {
  navigation: any;
}

export const TourSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Nạp danh sách tour qua Service (có fallback)
  useEffect(() => {
    let isMounted = true;

    const fetchTours = async () => {
      try {
        const data = await tourService.getAllTours();
        if (isMounted) {
          setTours(data);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách Tours:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTours();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Render từng thẻ lộ trình
  const renderItem = ({ item }: { item: Tour }) => {
    // Tự động lấy thời lượng (hỗ trợ cả duration, durationMinutes hoặc estimatedDuration)
    const durationDisplay =
      (item as any).duration ||
      (item as any).durationMinutes ||
      (item as any).estimatedDuration ||
      30;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // Điều hướng linh hoạt sang Map
          navigation.navigate('Map', { selectedTour: item });
        }}
      >
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.badge}>⏱ {durationDisplay} phút</Text>
          <Text style={styles.badge}>📍 {item.poiIds?.length || 0} điểm dừng</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chọn Lộ Trình Tham Quan</Text>
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 16, marginBottom: 12, color: '#1A1A1A' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 13, color: '#666', marginTop: 4, lineHeight: 18 },
  infoRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  badge: { fontSize: 12, color: '#007AFF', backgroundColor: '#EBF3FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
});