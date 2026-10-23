import React, { useState, useEffect, useRef } from 'react';

interface AdminDashboardScreenProps {
  onLogout?: () => void;
}

interface LanguageOption {
  code: string;
  iso: string;
  name: string;
  flagUrl: string;
  speechLang: string;
}

interface PoiItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  langCode: string;
  script: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', iso: 'vi', name: 'Vietnamese', flagUrl: 'https://flagcdn.com/w40/vn.png', speechLang: 'vi-VN' },
  { code: 'en', iso: 'en', name: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png', speechLang: 'en-US' },
  { code: 'zh', iso: 'zh', name: 'Chinese', flagUrl: 'https://flagcdn.com/w40/cn.png', speechLang: 'zh-CN' },
  { code: 'ja', iso: 'ja', name: 'Japanese', flagUrl: 'https://flagcdn.com/w40/jp.png', speechLang: 'ja-JP' },
  { code: 'ko', iso: 'ko', name: 'Korean', flagUrl: 'https://flagcdn.com/w40/kr.png', speechLang: 'ko-KR' },
];

const MULTI_LANG_SCRIPTS: Record<string, Record<string, string>> = {
  'P-01': {
    vi: 'Cổng Tam Quan là cổng dẫn lối vào khuôn viên Chùa Linh Ứng Bãi Bụt, mang đậm kiến trúc tâm linh Việt Nam.',
    en: 'Tam Quan Gate is the entrance to Linh Ung Bãi Bụt Pagoda, reflecting traditional Vietnamese spiritual architecture.',
    zh: '三关门是进入灵应寺海滩园区的入口，蕴含着越南传统宗教建筑特色。',
    ja: '三門（タムクアン門）はリンウン寺の境内への entrance であり、ベトナムの伝統的な仏教建築を反映しています。',
    ko: '삼관문은 린응사 바이붓 사찰 내부로 들어가는 입구로, 베트남 전통 영적 건축 양식을 잘 보여줍니다.',
  },
  'P-02': {
    vi: 'Chính điện được xây bằng mái ngói uốn cong, là nơi thờ tự linh thiêng chính của chùa.',
    en: 'The Main Hall features curved tiled roofs and serves as the main sacred place of worship in the pagoda.',
    zh: '主殿采用弯曲瓦顶建造，是寺庙内最庄严神圣的供奉与祈福之地。',
    ja: '本堂は曲線の瓦屋根で建てられており、寺院の中で最も神聖な礼拝の場となっています。',
    ko: '대웅전은 곡선 기와지붕으로 지어졌으며, 사찰 내에서 가장 신성한 불당입니다.',
  },
  'P-03': {
    vi: 'Tượng Quán Thế Âm cao 67m, đứng tựa lưng vào núi, hướng mặt ra biển Sơn Trà.',
    en: 'The Lady Buddha statue is 67 meters tall, standing with her back to the mountain and facing the Son Tra sea.',
    zh: '67米高的观世音菩萨像背靠大山，面朝山茶半岛蔚蓝的大海。',
    ja: '高さ67メートルの観音菩薩像は、山を背にソンチャ半島の海を見下ろすように立っています。',
    ko: '67m 높이의 해수관음상은 산을 등지고 손짜 반도의 푸른 바다를 바라보고 있습니다.',
  }
};

const INITIAL_POIS: PoiItem[] = [
  {
    id: 'P-01',
    name: 'Cổng Tam Quan - Chùa Linh Ứng Bãi Bụt',
    latitude: 16.1002,
    longitude: 108.2781,
    radius: 30,
    langCode: 'vi',
    script: MULTI_LANG_SCRIPTS['P-01']['vi']
  },
  {
    id: 'P-02',
    name: 'Chính Điện - Chùa Linh Ứng Bãi Bụt',
    latitude: 16.1008,
    longitude: 108.2785,
    radius: 50,
    langCode: 'vi',
    script: MULTI_LANG_SCRIPTS['P-02']['vi']
  },
  {
    id: 'P-03',
    name: 'Tượng Quán Thế Âm Bồ Tát 67m',
    latitude: 16.1012,
    longitude: 108.279,
    radius: 60,
    langCode: 'vi',
    script: MULTI_LANG_SCRIPTS['P-03']['vi']
  }
];

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'cms' | 'tours' | 'analytics'>('cms');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedPoiForQR, setSelectedPoiForQR] = useState<PoiItem | null>(null);

  const [activeUsersCount] = useState<number>(0);

  const [totalStreams, setTotalStreams] = useState<number>(() => {
    const savedStreams = localStorage.getItem('tourism_total_streams');
    return savedStreams ? parseInt(savedStreams, 10) : 1280;
  });

  const [poiList, setPoiList] = useState<PoiItem[]>(INITIAL_POIS);
  
  const [isFormLangOpen, setIsFormLangOpen] = useState(false);
  const [formSearchQuery, setFormSearchQuery] = useState('');
  
  const [openRowDropdownId, setOpenRowDropdownId] = useState<string | null>(null);
  const [rowSearchQuery, setRowSearchQuery] = useState('');

  const [newPoi, setNewPoi] = useState({
    name: '',
    image: '',
    latitude: '',
    longitude: '',
    radius: '',
    priority: '',
    script: MULTI_LANG_SCRIPTS['P-01']['vi'],
    region: 'Miền Trung',
    langCode: 'vi',
    audioFile: ''
  });

  const [tourList, setTourList] = useState([
    { id: 'T-01', name: 'Tour Di Sản Bái Đính 1 Ngày', poisCount: 5, status: 'Hoạt động' },
    { id: 'T-02', name: 'Tour Khám Phá Tâm Linh Mới', poisCount: 3, status: 'Bản nháp' },
  ]);
  const [newTourName, setNewTourName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSelectFormLanguage = (lang: LanguageOption) => {
    const sampleText = MULTI_LANG_SCRIPTS['P-01'][lang.code] || 'Welcome visitors to the heritage site.';
    setNewPoi({
      ...newPoi,
      langCode: lang.code,
      script: sampleText
    });
    setIsFormLangOpen(false);
    setFormSearchQuery('');
  };

  const handleSelectRowLanguage = (poiId: string, lang: LanguageOption) => {
    setPoiList(prevList =>
      prevList.map(item => {
        if (item.id === poiId) {
          const translatedScript = MULTI_LANG_SCRIPTS[poiId]?.[lang.code] || item.script;
          return {
            ...item,
            langCode: lang.code,
            script: translatedScript
          };
        }
        return item;
      })
    );
    setOpenRowDropdownId(null);
    setRowSearchQuery('');
  };

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
        { x: 260, y: 150, r: 85, intensity: 0.8 },
        { x: 570, y: 230, r: 100, intensity: 0.95 },
        { x: 820, y: 170, r: 70, intensity: 0.6 },
        { x: 420, y: 310, r: 90, intensity: 0.85 },
      ];

      points.forEach((p) => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `rgba(239, 68, 68, ${p.intensity})`);
        gradient.addColorStop(0.4, `rgba(245, 158, 11, ${p.intensity * 0.7})`);
        gradient.addColorStop(0.75, `rgba(59, 130, 246, ${p.intensity * 0.3})`);
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
    const createdPoi: PoiItem = {
      id: `P-0${poiList.length + 1}`,
      name: newPoi.name,
      latitude: Number(newPoi.latitude) || 16.1000,
      longitude: Number(newPoi.longitude) || 108.2700,
      radius: Number(newPoi.radius) || 30,
      langCode: newPoi.langCode,
      script: newPoi.script,
    };
    setPoiList([createdPoi, ...poiList]);
    setNewPoi({
      name: '',
      image: '',
      latitude: '',
      longitude: '',
      radius: '',
      priority: '',
      script: MULTI_LANG_SCRIPTS['P-01']['vi'],
      region: 'Miền Trung',
      langCode: 'vi',
      audioFile: ''
    });
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
    
    setTotalStreams((prev) => {
      const nextCount = prev + 1;
      localStorage.setItem('tourism_total_streams', nextCount.toString());
      return nextCount;
    });

    const utterance = new SpeechSynthesisUtterance(item.script || 'Thuyết minh tự động');
    const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === item.langCode) || SUPPORTED_LANGUAGES[0];

    utterance.lang = selectedLangObj.speechLang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(selectedLangObj.speechLang) || v.lang.replace('_', '-').startsWith(selectedLangObj.speechLang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    window.speechSynthesis.speak(utterance);
    setPlayingAudioId(item.id);
  };

  const currentFormLangObj = SUPPORTED_LANGUAGES.find(l => l.code === newPoi.langCode) || SUPPORTED_LANGUAGES[0];
  const filteredFormLangs = SUPPORTED_LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(formSearchQuery.toLowerCase()) || 
    l.iso.toLowerCase().includes(formSearchQuery.toLowerCase())
  );

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
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>Quản lý Trung tâm Địa điểm POI & Thuyết minh Đa ngôn ngữ</h1>
            
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '14px' }}>✨ Thêm Địa Điểm POI Mới</h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', position: 'relative' }}>
                <input style={{ flex: 2, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Tên địa điểm POI..." value={newPoi.name} onChange={(e) => setNewPoi({ ...newPoi, name: e.target.value })} />
                <input style={{ flex: 1.5, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="URL Hình ảnh đại diện..." value={newPoi.image} onChange={(e) => setNewPoi({ ...newPoi, image: e.target.value })} />
                
                <div style={{ flex: 1.5, position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setIsFormLangOpen(!isFormLangOpen)}
                    style={{ width: '100%', height: '100%', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={currentFormLangObj.flagUrl} alt={currentFormLangObj.name} style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }} />
                      <span>{currentFormLangObj.name} ({currentFormLangObj.iso})</span>
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>▼</span>
                  </button>

                  {isFormLangOpen && (
                    <div style={{ position: 'absolute', top: '105%', right: 0, width: '260px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                      <div style={{ padding: '8px', borderBottom: '1px solid #F1F5F9' }}>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={formSearchQuery}
                          onChange={(e) => setFormSearchQuery(e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {filteredFormLangs.map((lang) => (
                          <div
                            key={lang.code}
                            onClick={() => handleSelectFormLanguage(lang)}
                            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #F8FAFC', backgroundColor: newPoi.langCode === lang.code ? '#EFF6FF' : 'transparent', color: newPoi.langCode === lang.code ? '#2563EB' : '#1E293B', fontWeight: newPoi.langCode === lang.code ? 700 : 500 }}
                          >
                            <img src={lang.flagUrl} alt={lang.name} style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }} />
                            <span>{lang.name} ({lang.iso})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Vĩ độ (Latitude)..." value={newPoi.latitude} onChange={(e) => setNewPoi({ ...newPoi, latitude: e.target.value })} />
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Kinh độ (Longitude)..." value={newPoi.longitude} onChange={(e) => setNewPoi({ ...newPoi, longitude: e.target.value })} />
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Bán kính Geofence (m)..." value={newPoi.radius} onChange={(e) => setNewPoi({ ...newPoi, radius: e.target.value })} />
                <input style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Mức ưu tiên..." value={newPoi.priority} onChange={(e) => setNewPoi({ ...newPoi, priority: e.target.value })} />
              </div>

              <textarea style={{ width: '100%', height: '55px', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', marginBottom: '12px', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }} placeholder="Kịch bản thuyết minh văn bản..." value={newPoi.script} onChange={(e) => setNewPoi({ ...newPoi, script: e.target.value })} />

              <button type="button" onClick={handleAddPoi} style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%' }}>+ Lưu Cấu Hình Địa Điểm POI</button>
            </div>

            <div style={{ display: 'flex', backgroundColor: '#EFF6FF', padding: '14px', borderRadius: '8px', border: '1px solid #BFDBFE', fontWeight: 700, color: '#1D4ED8', fontSize: '13px', marginBottom: '6px' }}>
              <div style={{ flex: 1.5 }}>Tên POI</div>
              <div style={{ flex: 1.2 }}>Tọa độ GPS / Bán kính</div>
              <div style={{ flex: 1.5 }}>Ngôn ngữ phát</div>
              <div style={{ flex: 1.5 }}>Kịch bản TTS</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Mã QR / Preview</div>
            </div>

            {poiList.map((item: PoiItem, idx: number) => {
              const rowLangObj = SUPPORTED_LANGUAGES.find(l => l.code === item.langCode) || SUPPORTED_LANGUAGES[0];
              const filteredRowLangs = SUPPORTED_LANGUAGES.filter(l => 
                l.name.toLowerCase().includes(rowSearchQuery.toLowerCase()) || 
                l.iso.toLowerCase().includes(rowSearchQuery.toLowerCase())
              );

              return (
                <div key={item.id} style={{ display: 'flex', backgroundColor: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF', padding: '14px', borderRadius: '8px', marginBottom: '6px', alignItems: 'center', border: '1px solid #F1F5F9', fontSize: '13px', position: 'relative' }}>
                  <div style={{ flex: 1.5, fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                  <div style={{ flex: 1.2, color: '#64748B' }}>{item.latitude}, {item.longitude} ({item.radius}m)</div>
                  
                  <div style={{ flex: 1.5, position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenRowDropdownId(openRowDropdownId === item.id ? null : item.id);
                        setRowSearchQuery('');
                      }}
                      style={{ border: '1px solid #FCD34D', borderRadius: '8px', padding: '6px 10px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <img src={rowLangObj.flagUrl} alt={rowLangObj.name} style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} />
                      <span>{rowLangObj.name} ({rowLangObj.iso})</span>
                      <span style={{ fontSize: '9px', marginLeft: '4px' }}>▼</span>
                    </button>

                    {openRowDropdownId === item.id && (
                      <div style={{ position: 'absolute', top: '110%', left: 0, width: '240px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', zIndex: 200, overflow: 'hidden' }}>
                        <div style={{ padding: '6px', borderBottom: '1px solid #F1F5F9' }}>
                          <input
                            type="text"
                            placeholder="Search..."
                            value={rowSearchQuery}
                            onChange={(e) => setRowSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                          {filteredRowLangs.map((lang) => (
                            <div
                              key={lang.code}
                              onClick={() => handleSelectRowLanguage(item.id, lang)}
                              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #F8FAFC', backgroundColor: item.langCode === lang.code ? '#FEF3C7' : 'transparent', color: item.langCode === lang.code ? '#D97706' : '#1E293B', fontWeight: item.langCode === lang.code ? 700 : 500 }}
                            >
                              <img src={lang.flagUrl} alt={lang.name} style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} />
                              <span>{lang.name} ({lang.iso})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1.5, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }} title={item.script}>
                    {item.script}
                  </div>

                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    <button type="button" onClick={() => setSelectedPoiForQR(item)} style={{ backgroundColor: '#F1F5F9', padding: '6px 10px', borderRadius: '16px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: '#475569' }}>📷 QR</button>
                    <button type="button" onClick={() => handleTextToSpeech(item)} style={{ backgroundColor: playingAudioId === item.id ? '#FEF2F2' : '#EFF6FF', padding: '6px 10px', borderRadius: '16px', border: `1px solid ${playingAudioId === item.id ? '#EF4444' : '#2563EB'}`, fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: playingAudioId === item.id ? '#DC2626' : '#2563EB' }}>
                      {playingAudioId === item.id ? '⏸ Dừng' : '▶ Nghe'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'tours' ? (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', marginTop: 0 }}>Quản lý Lộ trình Tour & Liên kết Mã QR</h1>
            
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '14px' }}>✨ Tạo Tour Du Lịch & Liên Kết Danh Mục POI</h3>
              <input style={{ width: '100%', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px', marginBottom: '12px', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }} placeholder="Tên lộ trình tour..." value={newTourName} onChange={(e) => setNewTourName(e.target.value)} />
              <button type="button" onClick={handleAddTour} style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%' }}>+ Khởi Tạo Lộ Trình Tour</button>
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
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>4.5 <span style={{ fontSize: '16px' }}>phút</span></div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #F59E0B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>TOP POI ĐƯỢC NGHE NHIỀU NHẤT</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '10px', lineHeight: '1.3' }}>Chùa Linh Ứng Bãi Bụt</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>🗺️ Trực quan hóa luồng di chuyển du khách qua Bản đồ nhiệt (Heatmap)</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>Nhật ký di chuyển và lượt nghe được thu thập ẩn danh theo đúng tiêu chuẩn bảo mật.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '6px 12px', borderRadius: '20px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%', display: 'inline-block' }}></span>
                  <span style={{ color: '#DC2626', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>SPATIAL HEATMAP LIVE</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '380px', backgroundColor: '#F8FAFC', borderRadius: '12px', position: 'relative', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <canvas ref={canvasRef} width={850} height={380} style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
                <span style={{ fontWeight: 600 }}>Mức độ tập trung mật độ:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#64748B' }}>Thấp</span>
                  <div style={{ width: '140px', height: '10px', borderRadius: '5px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(245, 158, 11, 0.7), rgba(239, 68, 68, 1))' }}></div>
                  <span style={{ fontWeight: 700, color: '#DC2626' }}>Cao điểm (Hotspot)</span>
                </div>
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

            <button type="button" onClick={() => setSelectedPoiForQR(null)} style={{ backgroundColor: '#0F172A', padding: '12px 24px', borderRadius: '10px', width: '100%', border: 'none', color: '#FFFFFF', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};