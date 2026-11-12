import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { analyticsApi, MOCK_SESSION_ERROR } from '../../data/api/analyticsApi';
import type { HeatmapPoint, DashboardStats } from '../../data/api/analyticsApi';
import { poiApi } from '../../data/api/poiApi';
import type { UpdatePoiPayload } from '../../data/api/poiApi';
import { tourApi } from '../../data/api/tourApi';
import type { TourItem } from '../../data/api/tourApi';
import { EditPoiModal } from '../components/editPOIModal';

const ONLINE_SESSIONS_REFRESH_MS = 30_000;

function describeOnlineSessionsError(error: unknown): string {
  if (error instanceof Error && error.message === MOCK_SESSION_ERROR) {
    return 'Phiên đăng nhập cũ không có token thật. Vui lòng đăng xuất và đăng nhập lại.';
  }
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!error.response) return 'Không kết nối được máy chủ backend.';
    if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
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
  imageUrl?: string;
  audio?: {
    audioUrl?: string;
    ttsScript?: string;
    duration?: number;
  };
}

type EditablePoi = PoiItem & Pick<UpdatePoiPayload, 'description' | 'latitude' | 'longitude' | 'audio_url' | 'image_url'>;

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
    tourNamePlaceholder: 'Nhập tên tour du lịch mới...',
    createTourBtn: 'Khởi tạo Tour & Liên kết POI',
    tourListTitle: 'Danh sách Tour hiện tại',
    analyticsHeader: 'Tương tác & Spatial Heatmap',
    activeDevices: 'PHIÊN ĐANG ONLINE',
    totalStreams: 'TỔNG LƯỢT NGHE (ANONYMOUS)',
    avgDuration: 'THỜI LƯỢNG NGHE TRUNG BÌNH',
    topPoi: 'TOP POI ĐƯỢC NGHE NHIỀU NHẤT',
    heatmapTitle: 'Bản đồ nhiệt (Spatial Heatmap)',
    heatmapDesc: 'Hiển thị trực quan cường độ điểm nóng dựa trên tương tác thực tế từ CSDL.',
    close: 'Đóng',
    qrTitle: 'Mã QR Địa Điểm',
    qrSub: 'Bật ứng dụng Mobile để quét mã trực tiếp',
    preview: 'Nghe',
    stop: 'Dừng',
    delete: 'Xóa',
    coordsLabel: 'Tọa độ',
    poiCountLabel: 'Số lượng POI',
    poiPointsSuffix: 'điểm',
    minutesUnit: 'phút',
    poiCodeLabel: 'Mã POI',
    activeStatus: 'Hoạt động',
    draftStatus: 'Bản nháp'
  }
};

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onLogout }) => {
  const [currentLang, setCurrentLang] = useState('vi');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cms' | 'tours' | 'analytics'>('cms');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedPoiForQR, setSelectedPoiForQR] = useState<(PoiItem & { name: string }) | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<EditablePoi | null>(null);

  const t = ADMIN_TRANSLATIONS[currentLang] || ADMIN_TRANSLATIONS['vi'];
  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  // 1. POI State
  const [poiList, setPoiList] = useState<PoiItem[]>([]);
  const [poiListLoading, setPoiListLoading] = useState<boolean>(true);
  const [submittingPoi, setSubmittingPoi] = useState<boolean>(false);
  const [deletingPoiId, setDeletingPoiId] = useState<string | null>(null);

  // 2. Tour State
  const [tourList, setTourList] = useState<TourItem[]>([]);
  const [tourListLoading, setTourListLoading] = useState<boolean>(true);
  const [newTourName, setNewTourName] = useState('');
  const [newTourDesc, setNewTourDesc] = useState('');
  const [selectedPoiIds, setSelectedPoiIds] = useState<string[]>([]);
  const [submittingTour, setSubmittingTour] = useState<boolean>(false);
  const [deletingTourId, setDeletingTourId] = useState<string | null>(null);

  // State hỗ trợ Modal chỉnh sửa POI cho Tour có sẵn
  const [editingTour, setEditingTour] = useState<TourItem | null>(null);
  const [selectedPoiIdsForEdit, setSelectedPoiIdsForEdit] = useState<string[]>([]);
  const [savingTourPois, setSavingTourPois] = useState<boolean>(false);

  // 3. Analytics State
  const [onlineSessions, setOnlineSessions] = useState<number | null>(null);
  const [onlineSessionsLoading, setOnlineSessionsLoading] = useState<boolean>(true);
  const [onlineSessionsError, setOnlineSessionsError] = useState<string | null>(null);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalStreams: 0, avgDurationMinutes: 0, topPoiName: '—' });

  // Tải danh sách POI từ CSDL
  const fetchPois = async (): Promise<boolean> => {
    try {
      const data = await poiApi.getPois();
      setPoiList(Array.isArray(data) ? data : []);
      return true;
    } catch (error: unknown) {
      console.error('Lỗi lấy POI:', error);
      return false;
    } finally {
      setPoiListLoading(false);
    }
  };

  const handleOpenEditModal = (poi: PoiItem) => {
    setSelectedPoi({
      ...poi,
      description: poi.audio?.ttsScript || '',
      latitude: poi.location?.lat ?? 0,
      longitude: poi.location?.lng ?? 0,
      audio_url: poi.audio?.audioUrl || '',
      image_url: poi.imageUrl || '',
    });
  };

const handleSavePoi = async (updatedData: UpdatePoiPayload & { id: string }) => {
    const targetId = updatedData.id || selectedPoi?.id;

    if (!targetId) {
      alert('Không tìm thấy ID của POI đang chọn. Vui lòng tải lại danh sách và thử lại.');
      return;
    }

    // 🟢 Lấy trực tiếp các trường từ updatedData, không cần destructure bóc tách id thừa
    const latitude = Number(updatedData.latitude ?? updatedData.location?.lat ?? 0);
    const longitude = Number(updatedData.longitude ?? updatedData.location?.lng ?? 0);
    const radius = Number(updatedData.radius_meters ?? updatedData.radius ?? 30);
    const name_default = updatedData.name_default || updatedData.name || '';
    const description_default = updatedData.description_default || updatedData.description || '';

    const normalizedPayload: UpdatePoiPayload = {
      ...updatedData,
      name_default,
      name: name_default,
      description_default,
      description: description_default,
      latitude,
      longitude,
      radius,
      radius_meters: radius,
      location: { lat: latitude, lng: longitude },
    };

    console.log('🚀 [CMS SENDING PAYLOAD]:', { id: targetId, normalizedPayload });

    try {
      await poiApi.updatePoi(targetId, normalizedPayload);

      alert('Cập nhật địa điểm POI thành công!');
      setSelectedPoi(null);

      const reloaded = await fetchPois();
      if (!reloaded) {
        alert('Đã cập nhật POI nhưng không tải lại được danh sách. Vui lòng tải lại trang.');
      }
    } catch (error: unknown) {
      console.error('❌ Lỗi khi lưu POI:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || error.response?.data?.message || 'Lỗi không thể cập nhật POI');
      } else {
        alert('Lỗi không thể cập nhật POI');
      }
    }
  };
  
  useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    try {
      await fetchPois();
    } catch (err) {
      if (isMounted) {
        console.error("Lỗi khi tải danh sách POI:", err);
      }
    }
  };

  void loadData();

  return () => {
    isMounted = false;
  };
}, []);
  // Tải danh sách Tour từ CSDL Neon
  useEffect(() => {
    if (activeTab !== 'tours') return;
    let isMounted = true;
    tourApi.getTours()
      .then((data) => {
        if (isMounted) {
          setTourList(data || []);
          setTourListLoading(false);
        }
      })
      .catch((err: unknown) => {
        console.error('Lỗi lấy danh sách Tour:', err);
        if (isMounted) setTourListLoading(false);
      });
    return () => { isMounted = false; };
  }, [activeTab]);

  // Tải Analytics & Heatmap
  useEffect(() => {
    if (activeTab !== 'analytics') return;

    let cancelled = false;

    analyticsApi.getHeatmapData().then((data) => {
      if (!cancelled) setHeatmapPoints(data);
    }).catch(console.error);

    analyticsApi.getDashboardStats().then((data) => {
      if (!cancelled) setStats(data);
    }).catch(console.error);

    const loadSessions = async () => {
      try {
        const data = await analyticsApi.getOnlineSessions();
        if (cancelled) return;
        setOnlineSessions(data.onlineSessions);
        setOnlineSessionsError(null);
      } catch (error: unknown) {
        if (cancelled) return;
        setOnlineSessions(null);
        setOnlineSessionsError(describeOnlineSessionsError(error));
      } finally {
        if (!cancelled) setOnlineSessionsLoading(false);
      }
    };

    void loadSessions();
    const timer = window.setInterval(() => void loadSessions(), ONLINE_SESSIONS_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeTab]);

  const [newPoi, setNewPoi] = useState({
    name: '',
    image: '',
    latitude: '',
    longitude: '',
    radius: '30',
    priority: '10',
    script: 'Tượng Quan Thế Âm tại Chùa Linh Ứng Bãi Bụt cao 67m...',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tính tọa độ Pixel cho Heatmap
  const getPoiPixelCoords = useCallback((poi: PoiItem) => {
    if (!poiList || poiList.length === 0) return { x: 425, y: 200 };

    const lats = poiList.map(p => p.location.lat);
    const lngs = poiList.map(p => p.location.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latDiff = (maxLat - minLat) || 0.001;
    const lngDiff = (maxLng - minLng) || 0.001;
    const padding = 70;

    const canvasWidth = 850;
    const canvasHeight = 400;

    const x = padding + ((poi.location.lng - minLng) / lngDiff) * (canvasWidth - padding * 2);
    const y = padding + ((maxLat - poi.location.lat) / latDiff) * (canvasHeight - padding * 2);

    return { x, y };
  }, [poiList]);

  // Render Canvas Heatmap Thực tế theo Tọa độ & Lượt nghe
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
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      if (poiList.length === 0) return;

      const maxWeight = Math.max(...heatmapPoints.map(hp => hp.weight), 1);

      poiList.forEach((poi) => {
        const { x, y } = getPoiPixelCoords(poi);

        const matchPoint = heatmapPoints.find(hp =>
          (hp.id && hp.id === poi.id) ||
          (hp.lat && Math.abs(hp.lat - poi.location.lat) < 0.001 && Math.abs(hp.lng - poi.location.lng) < 0.001)
        );

        const weight = matchPoint ? matchPoint.weight : 1;
        const intensity = Math.min(1, weight / maxWeight);

        const baseRadius = 40 + intensity * 65;
        const alpha = 0.35 + intensity * 0.45;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, baseRadius);
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(245, 158, 11, ${alpha * 0.7})`);
        gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.25)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#EF4444';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      });
    }
  }, [activeTab, poiList, heatmapPoints, getPoiPixelCoords]);

  // Thêm POI mới
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
        location: { lat: Number(newPoi.latitude), lng: Number(newPoi.longitude) },
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

      setNewPoi({ name: '', image: '', latitude: '', longitude: '', radius: '30', priority: '10', script: '' });
      fetchPois();
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

  // Xóa POI
  const handleDeletePoi = async (poiId: string, poiName: string) => {
    if (!poiId) {
      alert('Không tìm thấy ID hợp lệ của địa điểm này!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa địa điểm "${poiName}" khỏi CSDL?`)) {
      return;
    }

    try {
      setDeletingPoiId(poiId);
      await poiApi.deletePoi(poiId);
      alert(`Đã xóa địa điểm "${poiName}" thành công khỏi CSDL!`);
      setPoiList((prevPois) => prevPois.filter((poi) => poi.id !== poiId));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Lỗi không có quyền hoặc không xóa được POI');
      } else {
        alert('Lỗi không thể xóa POI khỏi CSDL');
      }
    } finally {
      setDeletingPoiId(null);
    }
  };

  const toggleSelectPoiForTour = (poiId: string) => {
    setSelectedPoiIds(prev => 
      prev.includes(poiId) ? prev.filter(id => id !== poiId) : [...prev, poiId]
    );
  };

  const handleAddTour = async () => {
    if (!newTourName.trim()) {
      alert('Vui lòng nhập tên lộ trình tour!');
      return;
    }
    try {
      setSubmittingTour(true);
      const createdTour = await tourApi.createTour(newTourName.trim(), newTourDesc.trim(), selectedPoiIds);
      alert('Khởi tạo lộ trình Tour thành công vào CSDL!');
      setTourList([createdTour, ...tourList]);
      setNewTourName('');
      setNewTourDesc('');
      setSelectedPoiIds([]);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Lỗi tạo Tour');
      } else {
        alert('Lỗi không thể tạo Tour trong CSDL');
      }
    } finally {
      setSubmittingTour(false);
    }
  };

  const handleOpenEditTourModal = async (tour: TourItem) => {
    setEditingTour(tour);
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/admin/tours/${tour.id}/pois`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setSelectedPoiIdsForEdit(res.data.data.map((p: { id: string }) => p.id));
      } else {
        setSelectedPoiIdsForEdit([]);
      }
    } catch {
      setSelectedPoiIdsForEdit([]);
    }
  };

  const handleSaveTourPois = async () => {
    if (!editingTour) return;
    try {
      setSavingTourPois(true);
      await tourApi.updateTourPois(editingTour.id, selectedPoiIdsForEdit);
      alert('Cập nhật danh sách POI cho Tour thành công!');
      setTourList(prev =>
        prev.map(t =>
          t.id === editingTour.id ? { ...t, poiCount: selectedPoiIdsForEdit.length } : t
        )
      );
      setEditingTour(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Lỗi không thể cập nhật danh sách POI cho Tour');
      } else {
        alert('Lỗi không thể cập nhật danh sách POI cho Tour');
      }
    } finally {
      setSavingTourPois(false);
    }
  };

  const handleDeleteTour = async (tourId: string, tourName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Tour "${tourName}" không?`)) return;

    try {
      setDeletingTourId(tourId);
      await tourApi.deleteTour(tourId);
      alert('Xóa Tour thành công!');
      setTourList((prevTours) => prevTours.filter((tour) => tour.id !== tourId));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Không thể xóa Tour. Vui lòng thử lại sau.');
      } else {
        alert('Không thể xóa Tour. Vui lòng thử lại sau.');
      }
    } finally {
      setDeletingTourId(null);
    }
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      window.location.href = '/login';
    }
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
      
      {/* Sidebar Navigation */}
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

        <button
          onClick={handleLogoutAction}
          style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'left', flexShrink: 0 }}
        >
          🚪 {t.logout}
        </button>
      </div>

      {/* Main Area */}
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
          
          {/* TAB 1: POI MANAGEMENT */}
          {activeTab === 'cms' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>{t.cmsHeader}</h1>

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
                            onClick={() => handleOpenEditModal(item)}
                            style={{ padding: '6px 12px', backgroundColor: '#ffc107', color: '#000000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✏️ Sửa
                          </button>
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
                          
                          <button
                            type="button"
                            disabled={deletingPoiId === item.id}
                            onClick={() => handleDeletePoi(item.id, item.name)}
                            style={{ padding: '6px 10px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: deletingPoiId === item.id ? 'not-allowed' : 'pointer' }}
                          >
                            {deletingPoiId === item.id ? 'Đang xóa...' : '🗑️ Xóa'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TOUR MANAGEMENT */}
          {activeTab === 'tours' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>{t.tourHeader}</h1>

              {/* Form Tạo Tour Du Lịch Mới & Chọn POIs */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '12px' }}>{t.createTourTitle}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder={t.tourNamePlaceholder}
                    value={newTourName}
                    onChange={(e) => setNewTourName(e.target.value)}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Mô tả ngắn lộ trình tour du lịch..."
                    value={newTourDesc}
                    onChange={(e) => setNewTourDesc(e.target.value)}
                    style={{ padding: '10px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                    📍 Tích chọn địa điểm POI theo thứ tự ghé thăm (1, 2, 3...):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '140px', overflowY: 'auto', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                    {poiList.map((poi) => {
                      const idx = selectedPoiIds.indexOf(poi.id);
                      const isSelected = idx !== -1;
                      return (
                        <div
                          key={poi.id}
                          onClick={() => toggleSelectPoiForTour(poi.id)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`, backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer' }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#2563EB' : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{poi.name}</span>
                          {isSelected && <span style={{ backgroundColor: '#2563EB', color: '#FFF', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{idx + 1}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddTour}
                  disabled={submittingTour}
                  style={{ backgroundColor: submittingTour ? '#94A3B8' : '#2563EB', color: '#FFFFFF', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: submittingTour ? 'not-allowed' : 'pointer' }}
                >
                  {submittingTour ? 'Đang tạo...' : t.createTourBtn}
                </button>
              </div>

              {/* Danh sách Tour & Nút Gán POI */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '16px' }}>
                  {t.tourListTitle} ({tourListLoading ? '...' : tourList.length})
                </h3>

                {tourListLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '13px' }}>Đang tải danh sách Tour từ CSDL...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tourList.map((tour) => (
                      <div key={tour.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#F8FAFC' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB' }}>{tour.id}</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{tour.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{t.poiCountLabel}: <strong style={{ color: '#0F172A' }}>{tour.poiCount || 0} điểm</strong></div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditTourModal(tour)}
                            style={{ padding: '6px 12px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ⚙️ Gán POIs vào Tour
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTour(tour.id, tour.name)}
                            disabled={deletingTourId === tour.id}
                            style={{ padding: '6px 12px', backgroundColor: deletingTourId === tour.id ? '#FECACA' : '#DC3545', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: deletingTourId === tour.id ? 'not-allowed' : 'pointer' }}
                          >
                            {deletingTourId === tour.id ? 'Đang xóa...' : '🗑️ Xóa Tour'}
                          </button>
                          <span style={{ padding: '4px 10px', backgroundColor: tour.isActive ? '#DCFCE7' : '#FEF3C7', color: tour.isActive ? '#166534' : '#92400E', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                            {tour.isActive ? t.activeStatus : t.draftStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MODAL GÁN POIS CHO TOUR CÓ SẴN */}
              {editingTour && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div style={{ width: '480px', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Liên kết POI cho Tour</h3>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB', margin: '0 0 16px 0' }}>{editingTour.name}</p>

                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                      Tích chọn danh sách địa điểm theo thứ tự lịch trình (1, 2, 3...):
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', backgroundColor: '#F8FAFC', marginBottom: '20px' }}>
                      {poiList.map((poi) => {
                        const orderIdx = selectedPoiIdsForEdit.indexOf(poi.id);
                        const isChecked = orderIdx !== -1;
                        return (
                          <div
                            key={poi.id}
                            onClick={() => {
                              setSelectedPoiIdsForEdit(prev => 
                                prev.includes(poi.id) ? prev.filter(id => id !== poi.id) : [...prev, poi.id]
                              );
                            }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${isChecked ? '#2563EB' : '#CBD5E1'}`, backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer' }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#2563EB' : '#0F172A' }}>{poi.name}</span>
                            {isChecked && <span style={{ backgroundColor: '#2563EB', color: '#FFF', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{orderIdx + 1}</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingTour(null)}
                        style={{ padding: '8px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', backgroundColor: '#FFF', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTourPois}
                        disabled={savingTourPois}
                        style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: savingTourPois ? 'not-allowed' : 'pointer' }}
                      >
                        {savingTourPois ? 'Đang lưu...' : 'Lưu danh sách POI'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SPATIAL HEATMAP & ANALYTICS */}
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
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563EB' }}>{stats.totalStreams.toLocaleString()}</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>{t.avgDuration}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#10B981' }}>{stats.avgDurationMinutes} <span style={{ fontSize: '12px', color: '#64748B' }}>{t.minutesUnit}</span></div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>{t.topPoi}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>{stats.topPoiName}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>{t.heatmapTitle} ({t.poiCountLabel}: {poiList.length})</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0' }}>{t.heatmapDesc}</p>
                
                <div style={{ width: '100%', height: '400px', backgroundColor: '#F8FAFC', borderRadius: '12px', position: 'relative', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <canvas ref={canvasRef} width={850} height={400} style={{ width: '100%', height: '100%', display: 'block' }} />
                  
                  {poiList.map((poi) => {
                    const { x, y } = getPoiPixelCoords(poi);

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

      <EditPoiModal
        poi={selectedPoi}
        isOpen={selectedPoi !== null}
        onClose={() => setSelectedPoi(null)}
        onSave={handleSavePoi}
      />

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