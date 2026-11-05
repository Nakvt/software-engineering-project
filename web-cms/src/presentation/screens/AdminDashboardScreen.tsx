import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { analyticsApi, MOCK_SESSION_ERROR } from '../../data/api/analyticsApi';
import { poiApi } from '../../data/api/poiApi';

const ONLINE_SESSIONS_REFRESH_MS = 30_000;

function describeOnlineSessionsError(error: unknown): string {
  if (error instanceof Error && error.message === MOCK_SESSION_ERROR) {
    return 'Phiên đăng nhập cũ (mock) không có token thật. Vui lòng đăng xuất và đăng nhập lại.';
  }
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!error.response) return 'Không kết nối được máy chủ backend.';
    if (status === 401) return 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
    if (status === 403) return 'Tài khoản không có quyền xem thống kê này.';
  }
  return 'Không tải được số phiên online.';
}

interface AdminDashboardScreenProps {
  onLogout?: () => void;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  speechLang: string;
}

interface PoiItem {
  id: string;
  code?: string;
  name: string;
  location: { lat: number; lng: number };
  radius: number;
  priority?: number;
  audio?: {
    audioUrl?: string;
    ttsScript?: string;
    duration?: number;
  };
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: 'https://flagcdn.com/w40/vn.png', speechLang: 'vi-VN' },
  { code: 'en', name: 'Tiếng Anh', flag: 'https://flagcdn.com/w40/gb.png', speechLang: 'en-US' },
  { code: 'zh', name: 'Tiếng Trung', flag: 'https://flagcdn.com/w40/cn.png', speechLang: 'zh-CN' },
  { code: 'ja', name: 'Tiếng Nhật', flag: 'https://flagcdn.com/w40/jp.png', speechLang: 'ja-JP' },
  { code: 'ko', name: 'Tiếng Hàn', flag: 'https://flagcdn.com/w40/kr.png', speechLang: 'ko-KR' },
];

const ADMIN_TRANSLATIONS: Record<string, Record<string, string>> = {
  vi: {
    siteTitle: 'Tourism CMS - Chùa Linh Ứng Bãi Bụt',
    navPoi: 'Quản lý POI & Nội dung',
    navTour: 'Quản lý Tour & QR Code',
    navAnalytics: 'Tương tác & Spatial Heatmap',
    logout: 'Đăng xuất hệ thống',
    cmsHeader: 'Quản lý Trung tâm Địa điểm POI & Thuyết minh Đa ngôn ngữ',
    addPoiTitle: 'Thêm Địa Điểm POI Mới',
    poiNamePlaceholder: 'Tên địa điểm POI...',
    poiImgPlaceholder: 'Link Hình ảnh đại diện...',
    latPlaceholder: 'Vĩ độ (Latitude)...',
    lngPlaceholder: 'Kinh độ (Longitude)...',
    radiusPlaceholder: 'Bán kính Geofence (m)...',
    priorityPlaceholder: 'Độ ưu tiên...',
    scriptPlaceholder: 'Kịch bản thuyết minh mẫu...',
    savePoiBtn: '+ Lưu Địa Điểm Mới',
    poiListTitle: 'Danh sách POI hiện có',
    tourHeader: 'Quản lý Tour & Liên kết Danh mục POI',
    createTourTitle: 'Tạo Tour Du Lịch Mới',
    tourNamePlaceholder: 'Nhập tên tour...',
    createTourBtn: 'Khởi tạo Tour',
    tourListTitle: 'Danh sách Tour hiện tại',
    analyticsHeader: 'Tương tác & Spatial Heatmap',
    activeDevices: 'PHIÊN ĐANG ONLINE',
    totalStreams: 'TỔNG LƯỢT NGHE (ANONYMOUS)',
    avgDuration: 'THỜI LƯỢNG NGHE TRUNG BÌNH',
    topPoi: 'TOP POI ĐƯỢC NGHE NHIỀU NHẤT',
    heatmapTitle: 'Bản đồ nhiệt (Spatial Heatmap)',
    heatmapDesc: 'Hiển thị trực quan điểm nóng kèm theo tên của từng POI trong hệ thống.',
    close: 'Đóng',
    qrTitle: 'Mã QR Địa Điểm',
    qrSub: 'Bật ứng dụng Mobile để quét mã trực tiếp',
    preview: 'Nghe',
    stop: 'Dừng',
    coordsLabel: 'Tọa độ',
    poiCountLabel: 'Số lượng POI',
    poiPointsSuffix: 'điểm',
    minutesUnit: 'phút',
    poiCodeLabel: 'Mã POI',
    activeStatus: 'Hoạt động',
    draftStatus: 'Bản nháp'
  },
  en: {
    siteTitle: 'Tourism CMS - Linh Ung Pagoda',
    navPoi: 'POI & Content Management',
    navTour: 'Tour & QR Code Management',
    navAnalytics: 'Analytics & Spatial Heatmap',
    logout: 'Logout System',
    cmsHeader: 'CMS Location Center & Multi-language Narration',
    addPoiTitle: 'Add New POI Location',
    poiNamePlaceholder: 'POI location name...',
    poiImgPlaceholder: 'Image URL...',
    latPlaceholder: 'Latitude...',
    lngPlaceholder: 'Longitude...',
    radiusPlaceholder: 'Geofence Radius (m)...',
    priorityPlaceholder: 'Priority...',
    scriptPlaceholder: 'Sample narration script...',
    savePoiBtn: '+ Save New Location',
    poiListTitle: 'Existing POI List',
    tourHeader: 'Tour & POI Category Management',
    createTourTitle: 'Create New Tour',
    tourNamePlaceholder: 'Enter tour name...',
    createTourBtn: 'Initialize Tour',
    tourListTitle: 'Current Tour List',
    analyticsHeader: 'Interactions & Spatial Heatmap',
    activeDevices: 'ONLINE SESSIONS',
    totalStreams: 'TOTAL STREAMS (ANONYMOUS)',
    avgDuration: 'AVERAGE LISTENING DURATION',
    topPoi: 'TOP MOST LISTENED POI',
    heatmapTitle: 'Spatial Heatmap',
    heatmapDesc: 'Visualizing hotspots along with the name of each POI.',
    close: 'Close',
    qrTitle: 'Location QR Code',
    qrSub: 'Open Mobile app to scan directly',
    preview: 'Listen',
    stop: 'Stop',
    coordsLabel: 'Coordinates',
    poiCountLabel: 'POI Count',
    poiPointsSuffix: 'points',
    minutesUnit: 'mins',
    poiCodeLabel: 'POI Code',
    activeStatus: 'Active',
    draftStatus: 'Draft'
  }
};

const MULTI_LANG_TOURS: Record<string, Record<string, string>> = {
  'T-01': { vi: 'Tour Di Sản Bãi Bụt', en: 'Bai But Heritage Tour' },
  'T-02': { vi: 'Tour Khám Phá Tâm Linh', en: 'Spiritual Discovery Tour' }
};

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onLogout }) => {
  const [currentLang, setCurrentLang] = useState('vi');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cms' | 'tours' | 'analytics'>('cms');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedPoiForQR, setSelectedPoiForQR] = useState<(PoiItem & { name: string }) | null>(null);

  const t = ADMIN_TRANSLATIONS[currentLang] || ADMIN_TRANSLATIONS['vi'];
  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const [onlineSessions, setOnlineSessions] = useState<number | null>(null);
  const [onlineSessionsLoading, setOnlineSessionsLoading] = useState<boolean>(true);
  const [onlineSessionsError, setOnlineSessionsError] = useState<string | null>(null);

  const [poiList, setPoiList] = useState<PoiItem[]>([]);
  const [poiListLoading, setPoiListLoading] = useState<boolean>(true);
  const [submittingPoi, setSubmittingPoi] = useState<boolean>(false);

  // 💡 Tải POI từ CSDL chuẩn React Effect (Xử lý dứt điểm set-state-in-effect)
  useEffect(() => {
    let isMounted = true;
    poiApi.getPois()
      .then((data) => {
        if (isMounted) {
          setPoiList(data || []);
          setPoiListLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error('Không thể lấy danh sách POI từ Backend:', err);
        if (isMounted) {
          setPoiListLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time Analytics Effect
  useEffect(() => {
    if (activeTab !== 'analytics') return;

    let cancelled = false;
    const load = async () => {
      try {
        const data = await analyticsApi.getOnlineSessions();
        if (cancelled) return;
        setOnlineSessions(data.onlineSessions);
        setOnlineSessionsError(null);
      } catch (error) {
        if (cancelled) return;
        setOnlineSessions(null);
        setOnlineSessionsError(describeOnlineSessionsError(error));
      } finally {
        if (!cancelled) setOnlineSessionsLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), ONLINE_SESSIONS_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeTab]);

  const [totalStreams, setTotalStreams] = useState<number>(() => {
    const saved = localStorage.getItem('tourist_total_streams');
    return saved ? Number(saved) : 199;
  });

  useEffect(() => {
    localStorage.setItem('tourist_total_streams', totalStreams.toString());
  }, [totalStreams]);

  const [newPoi, setNewPoi] = useState({
    name: '',
    image: '',
    latitude: '',
    longitude: '',
    radius: '30',
    priority: '10',
    script: 'Tượng Quan Thế Âm tại Chùa Linh Ứng Bãi Bụt cao 67m...',
  });

  const [tourList, setTourList] = useState([
    { id: 'T-01', poiCount: 5, isRawActive: true },
    { id: 'T-02', poiCount: 3, isRawActive: false },
  ]);
  const [newTourName, setNewTourName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Canvas Spatial Heatmap
  useEffect(() => {
    if (activeTab === 'analytics') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      poiList.forEach((_, index) => {
        const stepX = canvas.width / (poiList.length + 1);
        const x = stepX * (index + 1);
        const y = 130 + Math.sin(index * 1.2) * 50;
        const r = 85;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
        gradient.addColorStop(0.35, 'rgba(245, 158, 11, 0.7)');
        gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.35)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [activeTab, poiList]);

  // 💡 Xử lý lưu POI (Thay any bằng unknown)
  const handleAddPoi = async () => {
    if (!newPoi.name || !newPoi.latitude || !newPoi.longitude) {
      alert('Vui lòng nhập Tên địa điểm, Vĩ độ và Kinh độ!');
      return;
    }

    try {
      setSubmittingPoi(true);

      const payload = {
        code: `POI_${Date.now()}`,
        name: newPoi.name.trim(),
        location: {
          lat: Number(newPoi.latitude),
          lng: Number(newPoi.longitude),
        },
        radius: Number(newPoi.radius) || 20,
        priority: Number(newPoi.priority) || 1,
        cooldownSeconds: 300,
        imageUrl: newPoi.image.trim() || undefined,
        content: {
          languageCode: currentLang,
          accent: 'north',
          title: newPoi.name.trim(),
          description: newPoi.script.trim(),
          ttsScript: newPoi.script.trim(),
        },
      };

      await poiApi.createPoi(payload);
      alert('Thêm địa điểm POI thành công vào CSDL!');

      setNewPoi({
        name: '',
        image: '',
        latitude: '',
        longitude: '',
        radius: '30',
        priority: '10',
        script: '',
      });

      const updatedPois = await poiApi.getPois();
      setPoiList(updatedPois || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Lỗi không thể lưu POI vào CSDL');
      } else {
        alert('Lỗi không thể lưu POI vào CSDL');
      }
    } finally {
      setSubmittingPoi(false);
    }
  };

  const handleAddTour = () => {
    if (!newTourName) {
      alert('Vui lòng nhập tên lộ trình tour!');
      return;
    }
    const newId = `T-0${tourList.length + 1}`;
    const createdTour = {
      id: newId,
      poiCount: poiList.length,
      isRawActive: false,
    };
    setTourList([createdTour, ...tourList]);
    setNewTourName('');
    alert('Khởi tạo lộ trình Tour thành công!');
  };

  const handleTextToSpeech = (item: PoiItem) => {
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

    setTotalStreams(prev => {
      const nextCount = prev + 1;
      localStorage.setItem('tourist_total_streams', nextCount.toString());
      return nextCount;
    });

    const currentScript = item.audio?.ttsScript || item.name;
    const utterance = new SpeechSynthesisUtterance(currentScript);
    utterance.lang = selectedLangObj.speechLang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(selectedLangObj.speechLang) || v.lang.replace('_', '-').startsWith(selectedLangObj.speechLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    window.speechSynthesis.speak(utterance);
    setPlayingAudioId(item.id);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box', backgroundColor: '#F8FAFC', fontFamily: 'Segoe UI, sans-serif', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation Left */}
      <div style={{ width: '280px', height: '100vh', backgroundColor: '#FFFFFF', padding: '24px 20px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }}></div>
          <h2 style={{ color: '#0F172A', fontSize: '18px', fontWeight: 800, margin: 0 }}>Tourism CMS</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          <button
            onClick={() => setActiveTab('cms')}
            style={{ padding: '12px 16px', borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'cms' ? '#EFF6FF' : 'transparent', color: activeTab === 'cms' ? '#2563EB' : '#64748B', fontWeight: activeTab === 'cms' ? 600 : 500, fontSize: '13px' }}
          >
            📍 {t.navPoi}
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            style={{ padding: '12px 16px', borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'tours' ? '#EFF6FF' : 'transparent', color: activeTab === 'tours' ? '#2563EB' : '#64748B', fontWeight: activeTab === 'tours' ? 600 : 500, fontSize: '13px' }}
          >
            🗺️ {t.navTour}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{ padding: '12px 16px', borderRadius: '8px', border: 'none', textAlign: 'left', cursor: 'pointer', backgroundColor: activeTab === 'analytics' ? '#EFF6FF' : 'transparent', color: activeTab === 'analytics' ? '#2563EB' : '#64748B', fontWeight: activeTab === 'analytics' ? 600 : 500, fontSize: '13px' }}
          >
            📊 {t.navAnalytics}
          </button>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'left', flexShrink: 0 }}
          >
            🚪 {t.logout}
          </button>
        )}
      </div>

      {/* Main Right Area */}
      <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ backgroundColor: '#F8FAFC', color: '#0F172A', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#1E293B' }}>{t.siteTitle}</h2>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <img src={selectedLangObj.flag} alt="" style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px' }} />
              <span>{selectedLangObj.name}</span>
              <span style={{ fontSize: '10px', color: '#64748B' }}>▼</span>
            </button>

            {isLangMenuOpen && (
              <div style={{ position: 'absolute', top: '120%', right: 0, width: '180px', backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 1000 }}>
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setIsLangMenuOpen(false);
                      window.speechSynthesis.cancel();
                      setPlayingAudioId(null);
                    }}
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: currentLang === lang.code ? '#EFF6FF' : 'transparent', color: currentLang === lang.code ? '#2563EB' : '#1E293B', fontWeight: currentLang === lang.code ? 700 : 500, fontSize: '13px' }}
                  >
                    <img src={lang.flag} alt="" style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px' }} />
                    <span>{lang.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div style={{ flex: 1, padding: '32px', overflow: 'auto', boxSizing: 'border-box' }}>
          {activeTab === 'cms' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>{t.cmsHeader}</h1>

              {/* Form Add POI */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '14px' }}>{t.addPoiTitle}</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder={t.poiNamePlaceholder}
                    value={newPoi.name}
                    onChange={(e) => setNewPoi({ ...newPoi, name: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder={t.poiImgPlaceholder}
                    value={newPoi.image}
                    onChange={(e) => setNewPoi({ ...newPoi, image: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder={t.latPlaceholder}
                    value={newPoi.latitude}
                    onChange={(e) => setNewPoi({ ...newPoi, latitude: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder={t.lngPlaceholder}
                    value={newPoi.longitude}
                    onChange={(e) => setNewPoi({ ...newPoi, longitude: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder={t.radiusPlaceholder}
                    value={newPoi.radius}
                    onChange={(e) => setNewPoi({ ...newPoi, radius: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder={t.priorityPlaceholder}
                    value={newPoi.priority}
                    onChange={(e) => setNewPoi({ ...newPoi, priority: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <textarea
                  placeholder={t.scriptPlaceholder}
                  value={newPoi.script}
                  onChange={(e) => setNewPoi({ ...newPoi, script: e.target.value })}
                  style={{ width: '100%', height: '55px', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '13px' }}
                />

                <button
                  type="button"
                  onClick={handleAddPoi}
                  disabled={submittingPoi}
                  style={{ backgroundColor: submittingPoi ? '#94A3B8' : '#2563EB', color: '#FFFFFF', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: submittingPoi ? 'not-allowed' : 'pointer' }}
                >
                  {submittingPoi ? 'Đang lưu...' : t.savePoiBtn}
                </button>
              </div>

              {/* List of POIs */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '16px' }}>
                  {t.poiListTitle} ({poiListLoading ? '...' : poiList.length})
                </h3>
                
                {poiListLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '13px' }}>Đang tải dữ liệu POI từ CSDL...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {poiList.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#F8FAFC' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '280px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>{item.code || item.id}</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{item.name}</span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>{t.coordsLabel}: {item.location?.lat}, {item.location?.lng}</span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#475569', flex: 1, margin: '0 20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.audio?.ttsScript || 'Chưa có kịch bản thuyết minh'}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPoiForQR({ ...item, name: item.name })}
                            style={{ padding: '6px 10px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            📱 QR
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTextToSpeech(item)}
                            style={{ padding: '6px 10px', backgroundColor: playingAudioId === item.id ? '#FEF2F2' : '#EFF6FF', color: playingAudioId === item.id ? '#DC2626' : '#2563EB', border: `1px solid ${playingAudioId === item.id ? '#FCA5A5' : '#BFDBFE'}`, borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            {playingAudioId === item.id ? `⏹ ${t.stop}` : `▶ ${t.preview}`}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tours' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>{t.tourHeader}</h1>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '12px' }}>{t.createTourTitle}</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder={t.tourNamePlaceholder}
                    value={newTourName}
                    onChange={(e) => setNewTourName(e.target.value)}
                    style={{ flex: 1, padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTour}
                    style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    {t.createTourBtn}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '16px' }}>{t.tourListTitle}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tourList.map((tour) => {
                    const translatedTourName = MULTI_LANG_TOURS[tour.id]?.[currentLang] || MULTI_LANG_TOURS['T-01']['vi'];
                    const statusText = tour.isRawActive ? t.activeStatus : t.draftStatus;

                    return (
                      <div key={tour.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>{tour.id}</div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{translatedTourName}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{t.poiCountLabel}: {tour.poiCount} {t.poiPointsSuffix}</div>
                        </div>
                        <span style={{ padding: '4px 10px', backgroundColor: tour.isRawActive ? '#DCFCE7' : '#FEF3C7', color: tour.isRawActive ? '#166534' : '#92400E', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                          {statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>{t.analyticsHeader}</h1>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>{t.activeDevices}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: onlineSessionsError ? '#94A3B8' : '#2563EB' }}>
                    {onlineSessionsLoading ? '...' : onlineSessions === null ? '—' : onlineSessions.toLocaleString()}
                  </div>
                  {onlineSessionsError && (
                    <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '6px' }}>{onlineSessionsError}</div>
                  )}
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>{t.totalStreams}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563EB' }}>{totalStreams.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>{t.avgDuration}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#10B981' }}>4.5 <span style={{ fontSize: '12px', color: '#64748B' }}>{t.minutesUnit}</span></div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>{t.topPoi}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>{poiList[0]?.name || 'Cổng Tam Quan'}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>{t.heatmapTitle} ({t.poiCountLabel}: {poiList.length})</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>{t.heatmapDesc}</p>
                
                <div style={{ width: '100%', height: '400px', backgroundColor: '#F8FAFC', borderRadius: '12px', position: 'relative', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <canvas ref={canvasRef} width={850} height={400} style={{ width: '100%', height: '100%', display: 'block' }} />
                  
                  {poiList.map((poi, index) => {
                    const stepX = 850 / (poiList.length + 1);
                    const x = stepX * (index + 1);
                    const y = 130 + Math.sin(index * 1.2) * 50;

                    return (
                      <div
                        key={poi.id}
                        style={{
                          position: 'absolute',
                          left: `${(x / 850) * 100}%`,
                          top: `${((y + 45) / 400) * 100}%`,
                          transform: 'translate(-50%, 0px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>{poi.code || poi.id}: {poi.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal QR Code */}
      {selectedPoiForQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ width: '340px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>{t.qrTitle}</h3>
            <p style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', margin: '0 0 16px 0' }}>{selectedPoiForQR.name}</p>

            <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <img
                style={{ width: '180px', height: '180px', display: 'block' }}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=poi://${selectedPoiForQR.code || selectedPoiForQR.id}`}
                alt="QR Code"
              />
            </div>

            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px' }}>{t.poiCodeLabel}: <span style={{ fontWeight: 700, color: '#2563EB' }}>{selectedPoiForQR.code || selectedPoiForQR.id}</span></div>
            <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginBottom: '20px' }}>{t.qrSub}</div>

            <button
              type="button"
              onClick={() => setSelectedPoiForQR(null)}
              style={{ backgroundColor: '#0F172A', color: '#FFFFFF', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardScreen;