import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const MOCK_POIS = [
  { id: '1', name: 'Vịnh Vĩnh Hy', description: 'Cảnh quan thiên nhiên tuyệt đẹp' },
  { id: '2', name: 'Hang Rái', description: 'Rạn san hô cổ và bình minh tuyệt đẹp' },
  { id: '3', name: 'Vườn Quốc gia Núi Chúa', description: 'Thảm thực vật đa dạng' },
];

export default function POIListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh Sách Địa Điểm (POI)</Text>
      <FlatList
        data={MOCK_POIS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#007AFF' },
  cardDesc: { fontSize: 14, color: '#666', marginTop: 4 },
});
