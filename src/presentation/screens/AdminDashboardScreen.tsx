import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MOCK_POIS, MOCK_ANALYTICS } from '../../data/mockCmsData';

const MOCK_TOURS = [
  { id: 'T-01', name: 'Tour Di Sản Bái Đính 1 Ngày', poisCount: 5, status: 'Hoạt động' },
  { id: 'T-02', name: 'Tour Khám Phá Tâm Linh Mới', poisCount: 3, status: 'Bản nháp' },
];

export const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState<'cms' | 'tours' | 'analytics'>('cms');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const toggleAudio = (id: string) => {
    setPlayingAudioId(playingAudioId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Navigation */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <View style={styles.logoDot} />
          <Text style={styles.logo}>Tourism CMS</Text>
        </View>

        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'cms' && styles.menuActive]}
          onPress={() => setActiveTab('cms')}
        >
          <Text style={[styles.menuText, activeTab === 'cms' && styles.menuTextActive]}>
            📍 Quản lý POI & Nội dung (Key 5, 6)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'tours' && styles.menuActive]}
          onPress={() => setActiveTab('tours')}
        >
          <Text style={[styles.menuText, activeTab === 'tours' && styles.menuTextActive]}>
            🗺️ Quản lý Tour & QR Code (Key 3, 6)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeTab === 'analytics' && styles.menuActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.menuText, activeTab === 'analytics' && styles.menuTextActive]}>
            📊 Thống kê & Spatial Heatmap (Key 7)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {activeTab === 'cms' ? (
          <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Quản lý Trung tâm Địa điểm POI & Thuyết minh (UC6)</Text>

            {/* FORM THÊM / CHỈNH SỬA POI ĐẦY ĐỦ TRƯỜNG DỮ LIỆU */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>✨ Thêm / Chỉnh sửa POI (Tọa độ, Bán kính, Hình ảnh, TTS, Audio)</Text>
              
              <View style={styles.rowInput}>
                <TextInput 
                  style={[styles.input, { flex: 2 }]} 
                  placeholder="Tên địa điểm POI (VD: Điện Tam Thế)..." 
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput 
                  style={[styles.input, { flex: 1.5 }]} 
                  placeholder="URL Hình ảnh đại diện..." 
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={styles.rowInput}>
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Vĩ độ (Latitude)..." 
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Kinh độ (Longitude)..." 
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Bán kính Geofence (m)..." 
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Mức ưu tiên Audio Queue (1-5)..." 
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Kịch bản TTS Multilingual & Giọng đọc Multi-accent */}
              <TextInput 
                style={[styles.input, { height: 50 }]} 
                placeholder="Kịch bản thuyết minh văn bản (Text-to-Speech TTS)..." 
                placeholderTextColor="#9CA3AF"
                multiline
              />

              <View style={styles.rowInput}>
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Phương vị giọng đọc (Bắc / Trung / Nam)..." 
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="File Audio thu sẵn (.mp3)..." 
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  placeholder="Ngôn ngữ (Tiếng Việt / English)..." 
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.btnText}>+ Lưu Cấu Hình Địa Điểm POI</Text>
              </TouchableOpacity>
            </View>

            {/* DANH SÁCH BẢNG POI TRỰC QUAN */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, styles.headerText, { flex: 1.5 }]}>Tên POI</Text>
              <Text style={[styles.cell, styles.headerText, { flex: 1.2 }]}>Tọa độ GPS / Bán kính</Text>
              <Text style={[styles.cell, styles.headerText]}>Giọng đọc</Text>
              <Text style={[styles.cell, styles.headerText, { flex: 1.5 }]}>Audio / Kịch bản TTS</Text>
              <Text style={[styles.cell, styles.headerText, { textAlign: 'center' }]}>Mã QR / Preview</Text>
            </View>

            {MOCK_POIS.map((item: any, idx: number) => (
              <View key={item.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                <Text style={[styles.cell, styles.fontMedium, { flex: 1.5 }]}>{item.name}</Text>
                <Text style={[styles.cell, styles.textMuted, { flex: 1.2 }]}>
                  {item.latitude}, {item.longitude} ({item.radius}m)
                </Text>
                <Text style={styles.cell}><Text style={styles.badgeRegion}>{item.region || 'Bắc (TTS)'}</Text></Text>
                <Text style={[styles.cell, styles.textMuted, { flex: 1.5 }]} numberOfLines={1}>
                  {item.script || 'Bài thuyết minh tự động qua GPS/Geofence...'}
                </Text>
                <View style={[styles.cell, { flexDirection: 'row', justifyContent: 'center', gap: 6 }]}>
                  <TouchableOpacity style={styles.qrBtn}>
                    <Text style={styles.qrBtnText}>📷 QR Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.audioBtn, playingAudioId === item.id && styles.audioBtnPlaying]}
                    onPress={() => toggleAudio(item.id)}
                  >
                    <Text style={[styles.audioBtnText, playingAudioId === item.id && styles.audioBtnTextPlaying]}>
                      {playingAudioId === item.id ? '⏸ Dừng' : '▶ Nghe'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : activeTab === 'tours' ? (
          <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Quản lý Lộ trình Tour & Liên kết Mã QR (UC6)</Text>
            
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>✨ Tạo Tour Du Lịch & Liên Kết Danh Mục POI</Text>
              <TextInput style={styles.input} placeholder="Tên lộ trình tour (VD: Tour Di Sản Bái Đính 1 Ngày)..." placeholderTextColor="#9CA3AF" />
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.btnText}>+ Khởi Tạo Lộ Trình Tour</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, styles.headerText]}>Mã Tour</Text>
              <Text style={[styles.cell, styles.headerText, { flex: 2 }]}>Tên Tour</Text>
              <Text style={[styles.cell, styles.headerText]}>Số POI gán</Text>
              <Text style={[styles.cell, styles.headerText, { textAlign: 'center' }]}>Trạng thái</Text>
            </View>

            {MOCK_TOURS.map((tour, idx) => (
              <View key={tour.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                <Text style={[styles.cell, styles.fontCode]}>{tour.id}</Text>
                <Text style={[styles.cell, styles.fontMedium, { flex: 2 }]}>{tour.name}</Text>
                <Text style={styles.cell}>{tour.poisCount} điểm dừng</Text>
                <View style={[styles.cell, { alignItems: 'center' }]}>
                  <Text style={tour.status === 'Hoạt động' ? styles.badgeSuccess : styles.badgeWarning}>
                    ● {tour.status}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView style={styles.section} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Thống kê Lượt nghe (Ẩn danh) & Spatial Heatmap (UC7)</Text>

            <View style={styles.statsContainer}>
              <View style={[styles.card, { borderLeftColor: '#2563EB', borderLeftWidth: 4 }]}>
                <Text style={styles.cardLabel}>TỔNG LƯỢT NGHE (ANONYMOUS)</Text>
                <Text style={styles.cardValue}>{MOCK_ANALYTICS.totalStreams}</Text>
              </View>
              <View style={[styles.card, { borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
                <Text style={styles.cardLabel}>THỜI LƯỢNG NGHE TRUNG BÌNH</Text>
                <Text style={[styles.cardValue, { color: '#10B981' }]}>{MOCK_ANALYTICS.avgDurationMinutes} <Text style={{fontSize: 16}}>phút</Text></Text>
              </View>
              <View style={[styles.card, { borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
                <Text style={styles.cardLabel}>TOP POI ĐƯỢC NGHE NHIỀU NHẤT</Text>
                <Text style={styles.cardValueSmall}>{MOCK_ANALYTICS.topPoi}</Text>
              </View>
            </View>

            {/* PHẦN HIỂN THỊ SPATIAL HEATMAP */}
            <View style={styles.heatmapBox}>
              <View style={styles.heatmapBadge}>
                <Text style={styles.heatmapBadgeText}>SPATIAL HEATMAP LIVE</Text>
              </View>
              <Text style={styles.heatmapText}>🗺️ Trực quan hóa luồng di chuyển du khách qua Bản đồ nhiệt (Heatmap)</Text>
              <Text style={styles.heatmapSubtext}>Nhật ký di chuyển và lượt nghe được thu thập ẩn danh theo đúng tiêu chuẩn bảo mật.</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC' },
  sidebar: { width: 260, backgroundColor: '#FFFFFF', padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB' },
  logo: { color: '#0F172A', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  menuActive: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  menuText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  menuTextActive: { color: '#2563EB', fontWeight: '700' },
  content: { flex: 1, padding: 32 },
  section: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 24 },
  formCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 14 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#F8FAFC', color: '#0F172A', fontSize: 13 },
  rowInput: { flexDirection: 'row', gap: 12 },
  primaryBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  tableRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, marginBottom: 6, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  tableRowEven: { backgroundColor: '#F8FAFC' },
  tableHeader: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  headerText: { fontWeight: '700', color: '#1D4ED8', fontSize: 13 },
  cell: { flex: 1, color: '#334155', fontSize: 13 },
  fontMedium: { fontWeight: '600', color: '#0F172A' },
  fontCode: { fontFamily: 'monospace', fontWeight: '700', color: '#475569' },
  textMuted: { color: '#64748B' },
  badgeRegion: { backgroundColor: '#FEF3C7', color: '#D97706', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 12, fontSize: 12, fontWeight: '700' },
  badgeSuccess: { backgroundColor: '#D1FAE5', color: '#059669', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, fontSize: 12, fontWeight: '700' },
  badgeWarning: { backgroundColor: '#FEF3C7', color: '#D97706', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, fontSize: 12, fontWeight: '700' },
  qrBtn: { backgroundColor: '#F1F5F9', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1' },
  qrBtnText: { color: '#475569', fontSize: 11, fontWeight: '700' },
  audioBtn: { backgroundColor: '#EFF6FF', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: '#2563EB' },
  audioBtnPlaying: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  audioBtnText: { color: '#2563EB', fontSize: 11, fontWeight: '700' },
  audioBtnTextPlaying: { color: '#DC2626' },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  card: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardLabel: { color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#2563EB' },
  cardValueSmall: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  heatmapBox: { height: 340, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', position: 'relative', padding: 20 },
  heatmapBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#EF4444', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  heatmapBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  heatmapText: { color: '#334155', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  heatmapSubtext: { color: '#64748B', fontSize: 13, textAlign: 'center' },
});