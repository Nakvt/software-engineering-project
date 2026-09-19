import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { MOCK_POIS, MOCK_ANALYTICS } from '../../data/mockCmsData';

export const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState<'cms' | 'analytics'>('cms');

  return (
    <View style={styles.container}>
      {/* Sidebar Navigation */}
      <View style={styles.sidebar}>
        <Text style={styles.logo}>Tourism CMS</Text>
        <TouchableOpacity 
          style={[styles.menuItem, activeTab === 'cms' && styles.menuActive]}
          onPress={() => setActiveTab('cms')}
        >
          <Text style={[styles.menuText, activeTab === 'cms' && styles.menuTextActive]}>
            Quản lý POI (Mục 6)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuItem, activeTab === 'analytics' && styles.menuActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.menuText, activeTab === 'analytics' && styles.menuTextActive]}>
            Thống kê & Heatmap (Mục 7)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {activeTab === 'cms' ? (
          <ScrollView style={styles.section}>
            <Text style={styles.title}>Quản lý Địa điểm (POI Management)</Text>
            
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, styles.headerText]}>Tên POI</Text>
              <Text style={[styles.cell, styles.headerText]}>Tọa độ (Lat, Long)</Text>
              <Text style={[styles.cell, styles.headerText]}>Bán kính (m)</Text>
              <Text style={[styles.cell, styles.headerText]}>Vùng miền</Text>
            </View>

            {/* Table Rows */}
            {MOCK_POIS.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.latitude}, {item.longitude}</Text>
                <Text style={styles.cell}>{item.radius}m</Text>
                <Text style={styles.cell}>{item.region}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView style={styles.section}>
            <Text style={styles.title}>Thống kê Du khách & Bản đồ Nhiệt</Text>
            
            {/* Stat Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Tổng lượt nghe</Text>
                <Text style={styles.cardValue}>{MOCK_ANALYTICS.totalStreams}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Thời lượng TB</Text>
                <Text style={styles.cardValue}>{MOCK_ANALYTICS.avgDurationMinutes} phút</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Top POI được nghe</Text>
                <Text style={styles.cardValueSmall}>{MOCK_ANALYTICS.topPoi}</Text>
              </View>
            </View>

            {/* Spatial Heatmap Placeholder */}
            <View style={styles.heatmapBox}>
              <Text style={styles.heatmapText}>[ Vùng hiển thị Bản đồ Nhiệt / Spatial Heatmap ]</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F3F4F6' },
  sidebar: { width: 240, backgroundColor: '#111827', padding: 20 },
  logo: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 30 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  menuActive: { backgroundColor: '#2563EB' },
  menuText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  menuTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  content: { flex: 1, padding: 30 },
  section: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  tableRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 6, marginBottom: 8 },
  tableHeader: { backgroundColor: '#EFF6FF' },
  headerText: { fontWeight: 'bold', color: '#2563EB' },
  cell: { flex: 1, color: '#111827' },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  card: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  cardLabel: { color: '#6B7280', fontSize: 12, marginBottom: 6 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#2563EB' },
  cardValueSmall: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  heatmapBox: { height: 320, backgroundColor: '#E5E7EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#9CA3AF' },
  heatmapText: { color: '#4B5563', fontWeight: '600' },
});
