import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';

// Import socket.io-client
let io: any = null;
try {
  io = require('socket.io-client').io;
} catch (e) {
  console.warn('socket.io-client chưa được kết nối.');
}

// --- COMPONENT VẼ SPATIAL HEATMAP CANVAS ---
const SpatialHeatmapCanvas = ({ points }: { points: Array<{ x: number; y: number; weight: number; label: string }> }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Phủ nền tối gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#090d16');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Vẽ lưới tọa độ (Grid lines)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 3. Vẽ các điểm nhiệt (Heatmap Glow Effect)
    points.forEach((pt) => {
      const radius = pt.weight * 32;
      const gradient = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, radius);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.95)');   // Tâm đỏ rực
      gradient.addColorStop(0.35, 'rgba(245, 158, 11, 0.65)'); // Vàng
      gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.25)');  // Xanh
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Nhãn tên POI
      ctx.fillStyle = '#f8fafc';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pt.label, pt.x, pt.y - radius - 6);

      // Tâm định vị
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points]);

  return (
    <View style={styles.canvasContainer}>
      <canvas
        ref={canvasRef as any}
        width={780}
        height={360}
        style={{ borderRadius: 12, width: '100%', maxHeight: 360, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
      />
    </View>
  );
};

export const AdminDashboardScreen = () => {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState<'poi' | 'tour' | 'stats'>('poi');

  // MẶC ĐỊNH BẮT ĐẦU TỪ 0 DU KHÁCH KHI CHƯA CÓ KẾT NỐI SOCKET REAL-TIME
  const [activeUsers, setActiveUsers] = useState(0);

  // KẾT NỐI REAL-TIME QUA SOCKET.IO
  useEffect(() => {
    if (io) {
      const socket = io('http://localhost:5000', { transports: ['websocket'] });

      socket.on('active_users_count', (count: number) => {
        setActiveUsers(count);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // --- STATES THỐNG KÊ ĐỘNG REAL-TIME ---
  const [totalListens, setTotalListens] = useState(1250);
  const [totalListenTimeSeconds, setTotalListenTimeSeconds] = useState(1250 * 270);
  
  const [poiListenCounts, setPoiListenCounts] = useState<{ [key: string]: number }>({
    '1': 310,
    '2': 458,
    '3': 482,
  });

  // Form states cho POI
  const [poiName, setPoiName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('30');
  const [scriptText, setScriptText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Bắc (TTS)');

  // Mock POI List
  const [poiList, setPoiList] = useState([
    {
      id: '1',
      name: 'Cổng Tam Quan - Chùa Linh Ứng Bãi Bụt',
      latitude: 16.1002,
      longitude: 108.2781,
      radius: 30,
      voice: 'Bắc (TTS)',
      script: 'Cổng Tam Quan là công trình kiến trúc đồ sộ dẫn vào khuôn viên chính...',
    },
    {
      id: '2',
      name: 'Chính Điện - Chùa Linh Ứng Bãi Bụt',
      latitude: 16.1008,
      longitude: 108.2785,
      radius: 50,
      voice: 'Bắc (TTS)',
      script: 'Chính điện được xây dựng theo phong cách tân cổ điển kết hợp truyền thống...',
    },
    {
      id: '3',
      name: 'Tượng Quán Thế Âm Bồ Tát 67m',
      latitude: 16.1012,
      longitude: 108.279,
      radius: 60,
      voice: 'Trung (TTS)',
      script: 'Tượng Quán Thế Âm Bồ Tát cao 67m, đứng tựa lưng vào núi, hướng ra biển...',
    },
  ]);

  const [selectedPoiForQR, setSelectedPoiForQR] = useState<any>(null);

  // Heatmap Points
  const heatmapDataPoints = [
    { x: 160, y: 120, weight: 2.5, label: 'Cổng Tam Quan' },
    { x: 420, y: 190, weight: 4.5, label: 'Tượng Phật 67m (Hotspot)' },
    { x: 630, y: 140, weight: 2.0, label: 'Chính Điện' },
  ];

  // Thời lượng trung bình (Phút)
  const avgDurationMinutes = (totalListenTimeSeconds / totalListens / 60).toFixed(1);

  // Top POI nghe nhiều nhất
  const getTopPoiInfo = () => {
    let topId = '3';
    let maxCount = -1;
    Object.entries(poiListenCounts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topId = id;
      }
    });
    const foundPoi = poiList.find((p) => p.id === topId);
    return {
      name: foundPoi ? foundPoi.name : 'Tượng Quán Thế Âm Bồ Tát 67m',
      count: maxCount > -1 ? maxCount : 482,
    };
  };

  const topPoi = getTopPoiInfo();

  const handleAddPoi = () => {
    if (!poiName || !lat || !lng) {
      alert('Vui lòng điền đầy đủ Tên POI, Vĩ độ và Kinh độ!');
      return;
    }
    const newId = Date.now().toString();
    const newPoi = {
      id: newId,
      name: poiName,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radius: parseInt(radius, 10) || 30,
      voice: selectedVoice,
      script: scriptText || 'Bài thuyết minh tự động qua GPS/Geofence.',
    };
    setPoiList([newPoi, ...poiList]);
    setPoiListenCounts({ ...poiListenCounts, [newId]: 0 });
    setPoiName('');
    setLat('');
    setLng('');
    setScriptText('');
    alert('Thêm điểm POI thành công!');
  };

  const handleSpeech = (poiItem: any) => {
    setTotalListens((prev) => prev + 1);
    const simulatedAudioDuration = Math.floor(Math.random() * 120) + 180;
    setTotalListenTimeSeconds((prev) => prev + simulatedAudioDuration);
    setPoiListenCounts((prev) => ({
      ...prev,
      [poiItem.id]: (prev[poiItem.id] || 0) + 1,
    }));

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(poiItem.script);
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt không hỗ trợ Web Speech API.');
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      {/* 1. SIDEBAR */}
      <View style={styles.sidebar}>
        <View style={styles.brandContainer}>
          <View style={styles.brandDot} />
          <Text style={styles.brandTitle}>Tourism CMS</Text>
        </View>

        <View style={styles.menuList}>
          <TouchableOpacity
            style={[styles.menuItem, activeTab === 'poi' && styles.menuItemActive]}
            onPress={() => setActiveTab('poi')}
          >
            <Text style={[styles.menuText, activeTab === 'poi' && styles.menuTextActive]}>
              📍 Quản lý POI & Nội dung
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, activeTab === 'tour' && styles.menuItemActive]}
            onPress={() => setActiveTab('tour')}
          >
            <Text style={[styles.menuText, activeTab === 'tour' && styles.menuTextActive]}>
              🗺️ Quản lý Tour & QR Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, activeTab === 'stats' && styles.menuItemActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.menuText, activeTab === 'stats' && styles.menuTextActive]}>
              📊 Thống kê & Spatial Heatmap
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sidebarFooter}>
          <Text style={styles.footerText}>Phiên bản Web CMS v2.4</Text>
        </View>
      </View>

      {/* 2. MAIN CONTENT */}
      <View style={styles.mainContent}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* TAB 1: QUẢN LÝ POI */}
          {activeTab === 'poi' && (
            <View style={styles.tabWrapper}>
              <Text style={styles.pageHeader}>Quản lý Trung tâm Địa điểm POI & Thuyết minh</Text>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>✨ Thêm / Chỉnh sửa POI (Tọa độ, Bán kính, Hình ảnh, TTS, Audio)</Text>
                <View style={styles.formGrid}>
                  <View style={[styles.formGroup, styles.col6]}>
                    <Text style={styles.label}>Tên địa điểm POI</Text>
                    <TextInput style={styles.input} placeholder="VD: Điện Tam Thế..." value={poiName} onChangeText={setPoiName} />
                  </View>
                  <View style={[styles.formGroup, styles.col6]}>
                    <Text style={styles.label}>URL Hình ảnh đại diện</Text>
                    <TextInput style={styles.input} placeholder="https://example.com/image.jpg" value={imageUrl} onChangeText={setImageUrl} />
                  </View>
                  <View style={[styles.formGroup, styles.col3]}>
                    <Text style={styles.label}>Vĩ độ (Latitude)</Text>
                    <TextInput style={styles.input} placeholder="16.1002" value={lat} onChangeText={setLat} />
                  </View>
                  <View style={[styles.formGroup, styles.col3]}>
                    <Text style={styles.label}>Kinh độ (Longitude)</Text>
                    <TextInput style={styles.input} placeholder="108.2781" value={lng} onChangeText={setLng} />
                  </View>
                  <View style={[styles.formGroup, styles.col3]}>
                    <Text style={styles.label}>Bán kính Geofence (m)</Text>
                    <TextInput style={styles.input} placeholder="30" value={radius} onChangeText={setRadius} />
                  </View>
                  <View style={[styles.formGroup, styles.col3]}>
                    <Text style={styles.label}>Giọng đọc thuyết minh</Text>
                    <TextInput style={styles.input} value={selectedVoice} onChangeText={setSelectedVoice} />
                  </View>
                  <View style={[styles.formGroup, styles.col12]}>
                    <Text style={styles.label}>Kịch bản thuyết minh văn bản (Text-to-Speech TTS)</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Nhập nội dung thuyết minh tự động khi du khách bước vào bán kính..."
                      value={scriptText}
                      onChangeText={setScriptText}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.btnPrimary} onPress={handleAddPoi}>
                  <Text style={styles.btnPrimaryText}>+ Lưu Cấu Hình Địa Điểm POI</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>📋 Danh sách địa điểm POI hiện có</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2.5 }]}>Tên POI</Text>
                  <Text style={[styles.th, { flex: 2 }]}>Tọa độ GPS / Bán kính</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Giọng đọc</Text>
                  <Text style={[styles.th, { flex: 2 }]}>Kịch bản / Thao tác</Text>
                </View>

                {poiList.map((item, idx) => (
                  <View key={item.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.tdBold, { flex: 2.5 }]}>{item.name}</Text>
                    <Text style={[styles.tdMuted, { flex: 2 }]}>{item.latitude}, {item.longitude} ({item.radius}m)</Text>
                    <View style={{ flex: 1.2 }}>
                      <View style={styles.badgeVoice}><Text style={styles.badgeVoiceText}>{item.voice}</Text></View>
                    </View>
                    <View style={[styles.rowActions, { flex: 2 }]}>
                      <TouchableOpacity style={styles.btnActionSecondary} onPress={() => setSelectedPoiForQR(item)}>
                        <Text style={styles.btnActionText}>📷 QR Code</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnActionPrimary} onPress={() => handleSpeech(item)}>
                        <Text style={styles.btnActionPrimaryText}>▶ Nghe TTS ({poiListenCounts[item.id] || 0})</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: QUẢN LÝ TOUR */}
          {activeTab === 'tour' && (
            <View style={styles.tabWrapper}>
              <Text style={styles.pageHeader}>Quản lý Lộ trình Tour & Liên kết Mã QR</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>✨ Tạo Tour Du Lịch & Liên Kết Danh Mục POI</Text>
                <View style={styles.formGrid}>
                  <View style={[styles.formGroup, styles.col12]}>
                    <Text style={styles.label}>Tên lộ trình tour</Text>
                    <TextInput style={styles.input} placeholder="VD: Tour Di Sản Bái Đính 1 Ngày..." />
                  </View>
                </View>
                <TouchableOpacity style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>+ Khởi Tạo Lộ Trình Tour</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 3: THỐNG KÊ (BẮT ĐẦU TỪ 0 DU KHÁCH) */}
          {activeTab === 'stats' && (
            <View style={styles.tabWrapper}>
              <Text style={styles.pageHeader}>Thống kê Lượt nghe (Ẩn danh) & Spatial Heatmap</Text>

              <View style={styles.statsGrid}>
                {/* THẺ NGƯỜI DÙNG HIỆN HÀNH (LIVE USERS REAL-TIME) */}
                <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
                  <View style={styles.liveHeader}>
                    <Text style={styles.statLabel}>NGƯỜI DÙNG HIỆN HÀNH (LIVE)</Text>
                    <View style={styles.greenPulseDot} />
                  </View>
                  <Text style={[styles.statValue, { color: '#10b981' }]}>
                    {activeUsers} <Text style={{ fontSize: 13, color: '#64748b' }}>du khách</Text>
                  </Text>
                  <Text style={styles.statSub}>
                    {activeUsers > 0 ? '● Đang kết nối khu vực di tích' : '○ Chưa có thiết bị kết nối'}
                  </Text>
                </View>

                {/* THẺ TỔNG LƯỢT NGHE */}
                <View style={[styles.statCard, { borderLeftColor: '#2563eb' }]}>
                  <Text style={styles.statLabel}>TỔNG LƯỢT NGHE (ANONYMOUS)</Text>
                  <Text style={[styles.statValue, { color: '#2563eb' }]}>
                    {totalListens.toLocaleString()}
                  </Text>
                  <Text style={styles.statSub}>▲ +18% so với tuần trước</Text>
                </View>

                {/* THẺ THỜI LƯỢNG TRUNG BÌNH */}
                <View style={[styles.statCard, { borderLeftColor: '#059669' }]}>
                  <Text style={styles.statLabel}>THỜI LƯỢNG TRUNG BÌNH</Text>
                  <Text style={[styles.statValue, { color: '#059669' }]}>
                    {avgDurationMinutes} phút
                  </Text>
                  <Text style={styles.statSub}>Chất lượng nội dung đạt chuẩn</Text>
                </View>

                {/* THẺ TOP POI */}
                <View style={[styles.statCard, { borderLeftColor: '#d97706' }]}>
                  <Text style={styles.statLabel}>TOP POI NHIỀU LƯỢT NGHE</Text>
                  <Text style={styles.statValueText} numberOfLines={1}>{topPoi.name}</Text>
                  <Text style={styles.statSub}>{topPoi.count} lượt kích hoạt Geofence</Text>
                </View>
              </View>

              {/* KHUNG HEATMAP LIVE */}
              <View style={styles.card}>
                <View style={styles.heatmapHeader}>
                  <Text style={styles.cardTitle}>🗺️ Trực quan hóa luồng di chuyển du khách qua Bản đồ nhiệt (Heatmap)</Text>
                  <View style={styles.badgeLive}>
                    <Text style={styles.badgeLiveText}>LIVE SPATIAL HEATMAP</Text>
                  </View>
                </View>

                <SpatialHeatmapCanvas points={heatmapDataPoints} />

                {/* CHÚ THÍCH */}
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Mật độ cao (Hotspot)</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} /><Text style={styles.legendText}>Mật độ trung bình</Text></View>
                  <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.legendText}>Mật độ thưa thớt</Text></View>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </View>

      {/* MODAL MÃ QR AN TOÀN KHÔNG VĂNG APP */}
      {selectedPoiForQR && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mã QR Điểm POI</Text>
              <Text style={styles.modalSubtitle}>{selectedPoiForQR.name}</Text>
              
              <View style={styles.qrBox}>
                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TOURISM_POI_${selectedPoiForQR.id}`,
                  }}
                  style={{ width: 180, height: 180 }}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.qrDescription}>
                Quét mã này trên App Mobile để định vị và nghe thuyết minh tự động.
              </Text>

              <TouchableOpacity style={styles.btnSecondary} onPress={() => setSelectedPoiForQR(null)}>
                <Text style={styles.btnSecondaryText}>Đóng Window</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  appContainer: { flexDirection: 'row', minHeight: '100vh' as any, width: '100vw' as any, backgroundColor: '#f8fafc' },
  sidebar: { width: 260, backgroundColor: '#ffffff', borderRightWidth: 1, borderRightColor: '#e2e8f0', paddingHorizontal: 20, paddingVertical: 24, justifyContent: 'space-between' },
  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  brandDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563eb', marginRight: 10 },
  brandTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', letterSpacing: 0.5 },
  menuList: { flex: 1 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginBottom: 8 },
  menuItemActive: { backgroundColor: '#eff6ff', borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  menuText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  menuTextActive: { color: '#2563eb', fontWeight: '700' },
  sidebarFooter: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  footerText: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  mainContent: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 32, flexGrow: 1 },
  tabWrapper: { width: '100%' },
  pageHeader: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 24 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0', width: '100%' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  formGroup: { paddingHorizontal: 8, marginBottom: 16 },
  col12: { width: '100%' }, col6: { width: '50%' }, col3: { width: '25%' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#0f172a', width: '100%' },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnPrimary: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8, width: '100%' },
  btnPrimaryText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, width: '100%' },
  th: { fontSize: 13, fontWeight: '700', color: '#475569' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', width: '100%' },
  tableRowAlt: { backgroundColor: '#fafafa' },
  tdBold: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  tdMuted: { fontSize: 13, color: '#64748b' },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnActionSecondary: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnActionText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  btnActionPrimary: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnActionPrimaryText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  badgeVoice: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeVoiceText: { fontSize: 12, fontWeight: '700', color: '#d97706' },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24, width: '100%' },
  statCard: { flex: 1, backgroundColor: '#ffffff', padding: 18, borderRadius: 12, borderLeftWidth: 5, borderWidth: 1, borderColor: '#e2e8f0' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statValueText: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  statSub: { fontSize: 11, color: '#64748b', marginTop: 4 },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greenPulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' },
  heatmapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badgeLive: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeLiveText: { fontSize: 11, fontWeight: '800', color: '#dc2626' },
  canvasContainer: { alignItems: 'center', marginVertical: 8, width: '100%' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#ffffff', width: 380, borderRadius: 16, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' },
  qrBox: { width: 220, height: 220, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginVertical: 16 },
  qrDescription: { fontSize: 12, color: '#64748b', marginBottom: 16, textAlign: 'center' },
  btnSecondary: { backgroundColor: '#f1f5f9', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center' },
  btnSecondaryText: { fontSize: 14, fontWeight: '600', color: '#334155' },
});