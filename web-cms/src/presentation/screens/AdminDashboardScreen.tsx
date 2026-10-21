import React, { useState, useEffect, useRef } from 'react';
import { MOCK_POIS, MOCK_ANALYTICS } from '../../data/mockCmsData';

interface AdminDashboardScreenProps {
  onLogout?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'cms' | 'tours' | 'analytics'>('analytics');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedPoiForQR, setSelectedPoiForQR] = useState<any | null>(null);

  const [activeUsersCount] = useState<number>(1);
  const [totalStreams, setTotalStreams] = useState<number>(MOCK_ANALYTICS.totalStreams);

  const [poiList, setPoiList] = useState(MOCK_POIS);
  const [newPoi, setNewPoi] = useState({
    name: '',
    image: '',
    latitude: '',
    longitude: '',
    radius: '',
    priority: '',
    script: '',
    region: 'Bắc (TTS)',
    audioFile: '',
    language: 'Tiếng Việt'
  });

  const [tourList, setTourList] = useState([
    { id: 'T-01', name: 'Tour Di Sản Bái Đính 1 Ngày', poisCount: 5, status: 'Hoạt động' },
    { id: 'T-02', name: 'Tour Khám Phá Tâm Linh Mới', poisCount: 3, status: 'Bản nháp' },
  ]);
  const [newTourName, setNewTourName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeTab === 'analytics') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const points = [
        { x: 250, y: 140, r: 70, intensity: 0.7 },
        { x: 550, y: 220, r: 90, intensity: 0.9 },
        { x: 800, y: 160, r: 60, intensity: 0.5 },
        { x: 400, y: 300, r: 80, intensity: 0.8 },
      ];

      points.forEach((p) => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `rgba(239, 68, 68, ${p.intensity})`);
        gradient.addColorStop(0.5, `rgba(245, 158, 11, ${p.intensity * 0.6})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [activeTab]);

  const handleAddPoi = () => {
    if (!newPoi.name) {
      alert('Vui lòng nhập tên địa điểm POI!');
      return;
    }
    const createdPoi = {
      id: `P-0${poiList.length + 1}`,
      name: newPoi.name,
      latitude: Number(newPoi.latitude) || 16.1000,
      longitude: Number(newPoi.longitude) || 108.2700,
      radius: Number(newPoi.radius) || 30,
      region: newPoi.region,
      script: newPoi.script || 'Bài thuyết minh tự động qua GPS/Geofence...',
    };
    setPoiList([createdPoi, ...poiList]);
    setNewPoi({ name: '', image: '', latitude: '', longitude: '', radius: '', priority: '', script: '', region: 'Bắc (TTS)', audioFile: '', language: 'Tiếng Việt' });
    alert('Thêm địa điểm POI thành công!');
  };

  const handleAddTour = () => {
    if (!newTourName) {
      alert('Vui lòng nhập tên lộ trình tour!');
      return;
    }
    const createdTour = {
      id: `T-0${tourList.length + 1}`,
      name: newTourName,
      poisCount: 3,
      status: 'Bản nháp'
    };
    setTourList([createdTour, ...tourList]);
    setNewTourName('');
    alert('Khởi tạo lộ trình Tour thành công!');
  };

  const handleTextToSpeech = (item: any) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ Web Speech API.');
      return;
    }
    if (playingAudioId === item.id) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }
    window.speechSynthesis.cancel();
    
    setTotalStreams((prev) => prev + 1);

    const utterance = new SpeechSynthesisUtterance(item.script || 'Thuyết minh tự động');
    utterance.lang = 'vi-VN';
    utterance.onend = () => setPlayingAudioId(null);
    window.speechSynthesis.speak(utterance);
    setPlayingAudioId(item.id);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box', backgroundColor: '#F8FAFC', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: '280px', height: '100vh', backgroundColor: '#FFFFFF', padding: '24px 20px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
          <h2 style={{ color: '#0F172A', fontSize: '18px', fontWeight: 800, margin: 0 }}>Tourism CMS</h2>
        </div>

        <button
          onClick={() => setActiveTab('cms')}
          style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '8px', border: 'none', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'cms' ? '#EFF6FF' : 'transparent', color: activeTab === 'cms' ? '#2563EB' : '#64748B', fontWeight: activeTab === 'cms' ? 700 : 600, fontSize: '13px' }}
        >
          📍 Quản lý POI & Nội dung
        </button>

        <button
          onClick={() => setActiveTab('tours')}
          style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '8px', border: 'none', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'tours' ? '#EFF6FF' : 'transparent', color: activeTab === 'tours' ? '#2563EB' : '#64748B', fontWeight: activeTab === 'tours' ? 700 : 600, fontSize: '13px' }}
        >
          🗺️ Quản lý Tour & QR Code
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '8px', border: 'none', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'analytics' ? '#EFF6FF' : 'transparent', color: activeTab === 'analytics' ? '#2563EB' : '#64748B', fontWeight: activeTab === 'analytics' ? 700 : 600, fontSize: '13px' }}
        >
          📊 Thống kê & Spatial Heatmap
        </button>

        {onLogout && (
          <button 
            onClick={onLogout}
            style={{ marginTop: 'auto', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
          >
            🚪 Đăng xuất hệ thống
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, height: '100vh', padding: '32px', overflowY: 'auto', boxSizing: 'border-box' }}>
        {activeTab === 'cms' ? (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>Quản lý Trung tâm Địa điểm POI & Thuyết minh</h1>
            
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '14px' }}>✨ Thêm / Chỉnh sửa POI (Tọa độ, Bán kính, Hình ảnh, TTS, Audio)</h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input style={{ flex: 2, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Tên địa điểm POI..." value={newPoi.name} onChange={(e) => setNewPoi({ ...newPoi, name: e.target.value })} />
                <input style={{ flex: 1.5, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="URL Hình ảnh đại diện..." value={newPoi.image} onChange={(e) => setNewPoi({ ...newPoi, image: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Vĩ độ (Latitude)..." value={newPoi.latitude} onChange={(e) => setNewPoi({ ...newPoi, latitude: e.target.value })} />
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Kinh độ (Longitude)..." value={newPoi.longitude} onChange={(e) => setNewPoi({ ...newPoi, longitude: e.target.value })} />
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Bán kính Geofence (m)..." value={newPoi.radius} onChange={(e) => setNewPoi({ ...newPoi, radius: e.target.value })} />
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Mức ưu tiên..." value={newPoi.priority} onChange={(e) => setNewPoi({ ...newPoi, priority: e.target.value })} />
              </div>

              <textarea style={{ width: '100%', height: '50px', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', marginBottom: '12px', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }} placeholder="Kịch bản thuyết minh văn bản (TTS)..." value={newPoi.script} onChange={(e) => setNewPoi({ ...newPoi, script: e.target.value })} />

              <button onClick={handleAddPoi} style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%' }}>+ Lưu Cấu Hình Địa Điểm POI</button>
            </div>

            <div style={{ display: 'flex', backgroundColor: '#EFF6FF', padding: '14px', borderRadius: '8px', border: '1px solid #BFDBFE', fontWeight: 700, color: '#1D4ED8', fontSize: '13px', marginBottom: '6px' }}>
              <div style={{ flex: 1.5 }}>Tên POI</div>
              <div style={{ flex: 1.2 }}>Tọa độ GPS / Bán kính</div>
              <div style={{ flex: 1 }}>Giọng đọc</div>
              <div style={{ flex: 1 }}>Audio / Kịch bản TTS</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Mã QR / Preview</div>
            </div>

            {poiList.map((item: any, idx: number) => (
              <div key={item.id} style={{ display: 'flex', backgroundColor: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF', padding: '14px', borderRadius: '8px', marginBottom: '6px', alignItems: 'center', border: '1px solid #F1F5F9', fontSize: '13px' }}>
                <div style={{ flex: 1.5, fontWeight: 600, color: '#0F172A' }}>{item.name}</div>
                <div style={{ flex: 1.2, color: '#64748B' }}>{item.latitude}, {item.longitude} ({item.radius}m)</div>
                <div style={{ flex: 1 }}><span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>{item.region || 'Bắc (TTS)'}</span></div>
                <div style={{ flex: 1, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>{item.script}</div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px' }}>
                  <button onClick={() => setSelectedPoiForQR(item)} style={{ backgroundColor: '#F1F5F9', padding: '6px 10px', borderRadius: '16px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: '#475569' }}>📷 QR Code</button>
                  <button onClick={() => handleTextToSpeech(item)} style={{ backgroundColor: playingAudioId === item.id ? '#FEF2F2' : '#EFF6FF', padding: '6px 10px', borderRadius: '16px', border: `1px solid ${playingAudioId === item.id ? '#EF4444' : '#2563EB'}`, fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: playingAudioId === item.id ? '#DC2626' : '#2563EB' }}>
                    {playingAudioId === item.id ? '⏸ Dừng' : '▶ Nghe'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'tours' ? (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>Quản lý Lộ trình Tour & Liên kết Mã QR</h1>
            
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '14px' }}>✨ Tạo Tour Du Lịch & Liên Kết Danh Mục POI</h3>
              <input style={{ width: '100%', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', marginBottom: '12px', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }} placeholder="Tên lộ trình tour..." value={newTourName} onChange={(e) => setNewTourName(e.target.value)} />
              <button onClick={handleAddTour} style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%' }}>+ Khởi Tạo Lộ Trình Tour</button>
            </div>

            <div style={{ display: 'flex', backgroundColor: '#EFF6FF', padding: '14px', borderRadius: '8px', border: '1px solid #BFDBFE', fontWeight: 700, color: '#1D4ED8', fontSize: '13px', marginBottom: '6px' }}>
              <div style={{ flex: 1 }}>Mã Tour</div>
              <div style={{ flex: 2 }}>Tên Tour</div>
              <div style={{ flex: 1 }}>Số POI gán</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Trạng thái</div>
            </div>

            {tourList.map((tour, idx) => (
              <div key={tour.id} style={{ display: 'flex', backgroundColor: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF', padding: '14px', borderRadius: '8px', marginBottom: '6px', alignItems: 'center', border: '1px solid #F1F5F9', fontSize: '13px' }}>
                <div style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>{tour.id}</div>
                <div style={{ flex: 2, fontWeight: 600, color: '#0F172A' }}>{tour.name}</div>
                <div style={{ flex: 1, color: '#334155' }}>{tour.poisCount} điểm dừng</div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ backgroundColor: tour.status === 'Hoạt động' ? '#D1FAE5' : '#FEF3C7', color: tour.status === 'Hoạt động' ? '#059669' : '#D97706', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>● {tour.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>Thống kê Lượt nghe (Ẩn danh) & Spatial Heatmap</h1>

            {/* 4 Thẻ chỉ số chính */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #8B5CF6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>NGƯỜI DÙNG HIỆN HÀNH</span>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#22C55E', borderRadius: '50%' }}></span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#8B5CF6', marginTop: '8px' }}>
                  {activeUsersCount} <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>online</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #2563EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>TỔNG LƯỢT NGHE (ANONYMOUS)</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB', marginTop: '8px' }}>{totalStreams}</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>THỜI LƯỢNG NGHE TRUNG BÌNH</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>{MOCK_ANALYTICS.avgDurationMinutes} <span style={{ fontSize: '16px' }}>phút</span></div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #F59E0B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>TOP POI ĐƯỢC NGHE NHIỀU NHẤT</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '10px', lineHeight: '1.3' }}>{MOCK_ANALYTICS.topPoi}</div>
              </div>
            </div>

            {/* Khung bản đồ nhiệt Heatmap */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>🗺️ Trực quan hóa luồng di chuyển du khách qua Bản đồ nhiệt (Heatmap)</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>Nhật ký di chuyển và lượt nghe được thu thập ẩn danh theo đúng tiêu chuẩn bảo mật.</p>
                </div>
                <span style={{ backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '6px' }}>SPATIAL HEATMAP LIVE</span>
              </div>

              <div style={{ width: '100%', height: '360px', backgroundColor: '#F8FAFC', borderRadius: '10px', position: 'relative', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <canvas ref={canvasRef} width={850} height={360} style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      {selectedPoiForQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ width: '340px', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Mã QR Địa Điểm</h3>
            <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', margin: '0 0 16px 0' }}>{selectedPoiForQR?.name}</p>

            <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
              <img style={{ width: '180px', height: '180px', borderRadius: '8px', display: 'block' }} src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=poi://${selectedPoiForQR.id}`} alt="QR Code" />
            </div>

            <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px' }}>Mã POI: <span style={{ fontWeight: 700, color: '#2563EB' }}>{selectedPoiForQR?.id}</span></div>
            <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginBottom: '20px' }}>Bật ứng dụng Mobile để quét mã trực tiếp</div>

            <button onClick={() => setSelectedPoiForQR(null)} style={{ backgroundColor: '#0F172A', padding: '12px 24px', borderRadius: '10px', width: '100%', border: 'none', color: '#FFFFFF', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};