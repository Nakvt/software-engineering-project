import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_TOURS } from '../../domain/models/mockTour';
import { Tour } from '../../domain/models/Tour';

interface Props {
  navigation: any;
}

export const TourSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const handleSelectTour = (tour: Tour) => {
    console.log('Đã chọn tour:', tour.name);
    // Chuyển hướng người dùng về Tab Bản đồ để bắt đầu đi theo lộ trình
    navigation.navigate('Map');
  };

  const renderTourCard = ({ item }: { item: Tour }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />

      <View style={styles.cardBody}>
        <Text style={styles.tourTitle}>{item.name}</Text>
        <Text style={styles.tourDesc} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Khối thông số tóm tắt: Số điểm, Thời gian, Chiều dài */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={16} color="#007AFF" />
            <Text style={styles.statText}>{item.poiIds.length} POIs</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#007AFF" />
            <Text style={styles.statText}>~{item.durationMinutes} phút</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="walk-outline" size={16} color="#007AFF" />
            <Text style={styles.statText}>{item.distanceKm} km</Text>
          </View>
        </View>

        {/* Nút bấm chọn tour */}
        <TouchableOpacity
          style={styles.selectBtn}
          activeOpacity={0.8}
          onPress={() => handleSelectTour(item)}
        >
          <Text style={styles.selectBtnText}>Bắt đầu Tour</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn Tour Tham Quan</Text>
        <Text style={styles.headerSubtitle}>
          Lựa chọn lộ trình phù hợp với thời gian của bạn
        </Text>
      </View>

      <FlatList
        data={MOCK_TOURS}
        keyExtractor={(item) => item.id}
        renderItem={renderTourCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 16,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 6,
  },
  tourDesc: {
    fontSize: 14,
    color: '#636366',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3a3a3c',
    marginLeft: 6,
  },
  selectBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 6,
  },
});