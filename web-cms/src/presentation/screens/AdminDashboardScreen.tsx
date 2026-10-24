import React, { useState, useEffect, useRef } from 'react';

interface AdminDashboardScreenProps {
  onLogout?: () => void;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  speechLang: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Vietnamese', flag: 'https://flagcdn.com/w40/vn.png', speechLang: 'vi-VN' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png', speechLang: 'en-US' },
  { code: 'zh', name: 'Chinese', flag: 'https://flagcdn.com/w40/cn.png', speechLang: 'zh-CN' },
  { code: 'ja', name: 'Japanese', flag: 'https://flagcdn.com/w40/jp.png', speechLang: 'ja-JP' },
  { code: 'ko', name: 'Korean', flag: 'https://flagcdn.com/w40/kr.png', speechLang: 'ko-KR' },
];

const ADMIN_TRANSLATIONS: Record<string, Record<string, string>> = {
  vi: {
    siteTitle: 'Tourism CMS - Chùa Linh Ứng Bãi Bụt',
    navPoi: 'Quản lý POI & Nội dung',
    navTour: 'Quản lý Tour & QR Code',
    navAnalytics: 'Tương tác & Spatial Heatmap',
    logout: 'Đăng xuất',
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
    activeDevices: 'THIẾT BỊ ĐANG HIỆN HÀNH',
    totalStreams: 'TỔNG LƯỢT NGHE',
    avgDuration: 'THỜI LƯỢNG NGHE TRUNG BÌNH',
    topPoi: 'TOP POI ĐƯỢC NGHE NHIỀU NHẤT',
    heatmapTitle: 'Bản đồ nhiệt',
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
    logout: 'Logout',
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
    activeDevices: 'ACTIVE DEVICES',
    totalStreams: 'TOTAL STREAMS',
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
  },
  zh: {
    siteTitle: '旅游内容管理系统 - 灵应寺',
    navPoi: 'POI 与内容管理',
    navTour: '旅游路线与二维码管理',
    navAnalytics: '互动与空间热力图',
    logout: '退出登录',
    cmsHeader: 'CMS 地点中心与多语言讲解管理',
    addPoiTitle: '添加新 POI 地点',
    poiNamePlaceholder: 'POI 地点名称...',
    poiImgPlaceholder: '图片链接...',
    latPlaceholder: '纬度...',
    lngPlaceholder: '经度...',
    radiusPlaceholder: '地理围栏半径 (米)...',
    priorityPlaceholder: '优先级...',
    scriptPlaceholder: '示例文本讲解...',
    savePoiBtn: '+ 保存新地点',
    poiListTitle: '现有 POI 列表',
    tourHeader: '旅游路线与 POI 分类管理',
    createTourTitle: '创建新旅游路线',
    tourNamePlaceholder: '输入路线名称...',
    createTourBtn: '初始化路线',
    tourListTitle: '当前路线列表',
    analyticsHeader: '互动与空间热力图',
    activeDevices: '当前活跃设备',
    totalStreams: '总收听次数',
    avgDuration: '平均收听时长',
    topPoi: '最热门 POI',
    heatmapTitle: '空间热力图',
    heatmapDesc: '直观显示热点以及每个 POI 的名称。',
    close: '关闭',
    qrTitle: '地点二维码',
    qrSub: '打开手机App直接扫描',
    preview: '收听',
    stop: '停止',
    coordsLabel: '坐标',
    poiCountLabel: 'POI 数量',
    poiPointsSuffix: '个地点',
    minutesUnit: '分钟',
    poiCodeLabel: 'POI 代码',
    activeStatus: '活跃',
    draftStatus: '草稿'
  },
  ja: {
    siteTitle: 'ツーリズム CMS - リンウン寺',
    navPoi: 'POI & コンテンツ管理',
    navTour: 'ツアー & QRコード管理',
    navAnalytics: 'インタラクション & ヒートマップ',
    logout: 'ログアウト',
    cmsHeader: 'CMS ロケーションセンター & 多言語音声ガイド',
    addPoiTitle: '新規 POI 場所の追加',
    poiNamePlaceholder: 'POI名...',
    poiImgPlaceholder: '画像URL...',
    latPlaceholder: '緯度...',
    lngPlaceholder: '経度...',
    radiusPlaceholder: 'ジオフェンス半径 (m)...',
    priorityPlaceholder: '優先度...',
    scriptPlaceholder: '音声ガイドスクリプト...',
    savePoiBtn: '+ 新規場所を保存',
    poiListTitle: '既存の POI リスト',
    tourHeader: 'ツアー & POI カテゴリ管理',
    createTourTitle: '新規ツアー作成',
    tourNamePlaceholder: 'ツアー名を入力...',
    createTourBtn: 'ツアーを作成',
    tourListTitle: '現在のツアーリスト',
    analyticsHeader: 'インタラクション & スペシャルヒートマップ',
    activeDevices: 'アクティブデバイス',
    totalStreams: '総ストリーミング数',
    avgDuration: '平均リスニング時間',
    topPoi: '最も聴かれた POI',
    heatmapTitle: 'スペシャルヒートマップ',
    heatmapDesc: '各 POI の名前と一緒にホットスポットを視覚化します。',
    close: '閉じる',
    qrTitle: '場所のQRコード',
    qrSub: 'モバイルアプリを開いて直接スキャン',
    preview: '聴く',
    stop: '停止',
    coordsLabel: '座標',
    poiCountLabel: 'POI数',
    poiPointsSuffix: '箇所',
    minutesUnit: '分',
    poiCodeLabel: 'POIコード',
    activeStatus: 'アクティブ',
    draftStatus: '下書き'
  },
  ko: {
    siteTitle: '관광 CMS - 린응 사원',
    navPoi: 'POI 및 콘텐츠 관리',
    navTour: '투어 및 QR 코드 관리',
    navAnalytics: '상호 작용 및 히트맵',
    logout: '로그아웃',
    cmsHeader: 'CMS 위치 센터 및 다국어 해설 관리',
    addPoiTitle: '새 POI 위치 추가',
    poiNamePlaceholder: 'POI 위치 이름...',
    poiImgPlaceholder: '이미지 링크...',
    latPlaceholder: '위도...',
    lngPlaceholder: '경도...',
    radiusPlaceholder: '지오펜스 반경 (m)...',
    priorityPlaceholder: '우선순위...',
    scriptPlaceholder: '해설 대본 샘플...',
    savePoiBtn: '+ 새 위치 저장',
    poiListTitle: '기존 POI 목록',
    tourHeader: '투어 및 POI 카테고리 관리',
    createTourTitle: '새 투어 생성',
    tourNamePlaceholder: '투어 이름 입력...',
    createTourBtn: '투어 초기화',
    tourListTitle: '현재 투어 목록',
    analyticsHeader: '상호 작용 및 공간 히트맵',
    activeDevices: '현재 활성 기기',
    totalStreams: '총 스트림',
    avgDuration: '평균 청취 시간',
    topPoi: '가장 많이 청취된 POI',
    heatmapTitle: '공간 히트맵',
    heatmapDesc: '각 POI의 이름과 함께 핫스팟을 시각화합니다.',
    close: '닫기',
    qrTitle: '위치 QR 코드',
    qrSub: '모바일 앱을 켜고 직접 스캔하세요',
    preview: '듣기',
    stop: '중지',
    coordsLabel: '좌표',
    poiCountLabel: 'POI 수',
    poiPointsSuffix: '개',
    minutesUnit: '분',
    poiCodeLabel: 'POI 코드',
    activeStatus: '활성',
    draftStatus: '초안'
  }
};

const MULTI_LANG_NAMES: Record<string, Record<string, string>> = {
  'P-01': {
    vi: 'Cổng Tam Quan',
    en: 'Tam Quan Gate',
    zh: '三关门',
    ja: '三門 (タムクアン門)',
    ko: '삼관문'
  },
  'P-02': {
    vi: 'Tòa chính điện',
    en: 'Main Hall',
    zh: '正殿',
    ja: '本殿',
    ko: '대웅전'
  },
  'P-03': {
    vi: 'Tượng Phật Quan Âm',
    en: 'Lady Buddha Statue',
    zh: '观音佛像',
    ja: '観音菩薩像',
    ko: '해수관음상'
  },
  'P-04': {
    vi: 'Tháp Xá Lợi',
    en: 'Sarira Tower',
    zh: '舍利塔',
    ja: '舎利塔',
    ko: '사리탑'
  },
  'P-05': {
    vi: 'Vườn Lâm Tỳ Ni',
    en: 'Lumbini Garden',
    zh: '蓝毗尼园',
    ja: 'ルンビニ園',
    ko: '룸비니 정원'
  }
};

const MULTI_LANG_TOURS: Record<string, Record<string, string>> = {
  'T-01': {
    vi: 'Tour Di Sản Bãi Bụt',
    en: 'Bai But Heritage Tour',
    zh: '拜佛遗产之旅',
    ja: 'バイブット遺産ツアー',
    ko: '바이붓 유산 투어'
  },
  'T-02': {
    vi: 'Tour Khám Phá Tâm Linh',
    en: 'Spiritual Discovery Tour',
    zh: '心灵探索之旅',
    ja: 'スピリチュアル発見ツアー',
    ko: '영성 탐방 투어'
  }
};

const MULTI_LANG_SCRIPTS: Record<string, Record<string, string>> = {
  'P-01': {
    vi: 'Cổng Tam Quan là cánh cổng dẫn lối vào khuôn viên chùa Linh Ứng Bãi Bụt. Cổng được thiết kế theo lối kiến trúc Việt cổ, mái ngói lưu ly cong vút hai đầu.',
    en: 'The Tam Quan Gate is the gateway leading into the grounds of Linh Ung Bai But Pagoda. The gate is designed in traditional Vietnamese architecture.',
    zh: '三关门是通往灵应寺拜佛园区的入口，采用传统越南建筑风格，两端飞檐翘角。',
    ja: '三門（タムクアン門）は、リンウン寺の境内への入り口であり、ベトナムの伝統的な建築様式で造られています。',
    ko: '삼관문은 링응사 바이붓 사원 내부로 들어가는 입구입니다. 이 문은 베트남 전통 건축 양식으로 지어졌습니다.'
  },
  'P-02': {
    vi: 'Chính điện được lợp bằng mái ngói uốn cong có hình rồng, bao quanh là các trụ cột to vững chắc thờ các pho tượng lớn.',
    en: 'The Main Hall features curved tiled roofs with dragon motifs, surrounded by sturdy pillars.',
    zh: '正殿采用龙形翘角屋顶，四周环绕着坚固的柱子。',
    ja: '本殿は竜の形をした反り屋根を持ち、頑丈な柱に囲まれています。',
    ko: '본전은 용 모양의 곡선 기와지붕으로 지어졌습니다.'
  },
  'P-03': {
    vi: 'Tượng Phật Quan Thế Âm có độ cao 67m, đường kính tòa sen 35m, là tượng Phật cao nhất khu vực Đông Nam Á.',
    en: 'The Lady Buddha statue is 67 meters tall, recognized as the tallest Avalokiteshvara statue in Southeast Asia.',
    zh: '观世音菩萨像高67米，是东南亚最高的观音菩萨像。',
    ja: '高さ67メートルの観音菩薩像は、東南アジアで最も高い観音像です。',
    ko: '67m 높이의 관세음보살상은 동남아시아에서 가장 높습니다.'
  },
  'P-04': {
    vi: 'Tháp Xá Lợi tọa lạc ở phía bên trái khu chánh điện, gồm 9 tầng đại diện cho 9 bậc tu hành trong Phật giáo.',
    en: 'The Sarira Tower, located on the left side of the main hall, consists of 9 floors representing 9 stages.',
    zh: '舍利塔位于正殿左侧，共9层，代表佛教的9个修行阶梯。',
    ja: '舎利塔は本殿の左側に位置し、仏教の9つの修行階層を表す9階建てです。',
    ko: '사리탑은 본전 왼쪽에 위치하며 9층으로 이루어져 있습니다.'
  },
  'P-05': {
    vi: 'Công trình vườn Lâm Tỳ Ni nằm phía trước giảng đường, mô phỏng thánh tích thượng uyển kinh thành Ca Tỳ La Vệ.',
    en: 'The Lumbini Garden located in front of the lecture hall simulates the sacred garden of Kapilavastu.',
    zh: '蓝毗尼园位于讲堂前方，模拟释迦牟尼诞生地的圣迹。',
    ja: 'ルンビニ園は講堂の前に位置し、仏陀誕生の聖地を模したものです。',
    ko: '룸비니 정원은 붓다의 탄생지를 재현한 성스러운 정원입니다.'
  }
};

const INITIAL_POIS = [
  { id: 'P-01', latitude: 16.1001, longitude: 108.2778, radius: 30 },
  { id: 'P-02', latitude: 16.1005, longitude: 108.2781, radius: 50 },
  { id: 'P-03', latitude: 16.1012, longitude: 108.279, radius: 60 },
  { id: 'P-04', latitude: 16.1008, longitude: 108.2775, radius: 40 },
  { id: 'P-05', latitude: 16.1002, longitude: 108.2770, radius: 35 }
];

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onLogout }) => {
  const [currentLang, setCurrentLang] = useState('vi');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cms' | 'tours' | 'analytics'>('cms');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedPoiForQR, setSelectedPoiForQR] = useState<any | null>(null);

  const t = ADMIN_TRANSLATIONS[currentLang] || ADMIN_TRANSLATIONS['vi'];
  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const [activeUsersCount] = useState<number>(0);

  // Đổi giá trị khởi tạo từ 12450 thành 199
  const [totalStreams, setTotalStreams] = useState<number>(() => {
    const saved = localStorage.getItem('tourist_total_streams');
    return saved ? Number(saved) : 199;
  });

  useEffect(() => {
    localStorage.setItem('tourist_total_streams', totalStreams.toString());
  }, [totalStreams]);

  const [poiList, setPoiList] = useState(INITIAL_POIS);

  const [newPoi, setNewPoi] = useState({
    name: '',
    image: '',
    latitude: '',
    longitude: '',
    radius: '',
    priority: '',
    script: '',
  });

  useEffect(() => {
    const defaultScript = MULTI_LANG_SCRIPTS['P-01'][currentLang] || MULTI_LANG_SCRIPTS['P-01']['vi'];
    setNewPoi(prev => ({
      ...prev,
      script: defaultScript
    }));
  }, [currentLang]);

  const [tourList, setTourList] = useState([
    { id: 'T-01', poiCount: 5, isRawActive: true },
    { id: 'T-02', poiCount: 3, isRawActive: false },
  ]);
  const [newTourName, setNewTourName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const handleAddPoi = () => {
    if (!newPoi.name) {
      alert('Vui lòng nhập tên địa điểm POI!');
      return;
    }
    const newId = `P-0${poiList.length + 1}`;
    const createdPoi = {
      id: newId,
      latitude: Number(newPoi.latitude) || 16.1000,
      longitude: Number(newPoi.longitude) || 108.2700,
      radius: Number(newPoi.radius) || 30,
    };
    if (!MULTI_LANG_NAMES[newId]) {
      MULTI_LANG_NAMES[newId] = {
        vi: newPoi.name,
        en: newPoi.name,
        zh: newPoi.name,
        ja: newPoi.name,
        ko: newPoi.name
      };
    }
    if (!MULTI_LANG_SCRIPTS[newId]) {
      MULTI_LANG_SCRIPTS[newId] = {
        vi: newPoi.script,
        en: `Description for ${newPoi.name}`,
        zh: `${newPoi.name} 简介`,
        ja: `${newPoi.name} の説明`,
        ko: `${newPoi.name} 설명`
      };
    }
    setPoiList([createdPoi, ...poiList]);
    setNewPoi({
      name: '',
      image: '',
      latitude: '',
      longitude: '',
      radius: '',
      priority: '',
      script: MULTI_LANG_SCRIPTS['P-01'][currentLang] || MULTI_LANG_SCRIPTS['P-01']['vi'],
    });
    alert('Thêm địa điểm POI thành công!');
  };

  const handleAddTour = () => {
    if (!newTourName) {
      alert('Vui lòng nhập tên lộ trình tour!');
      return;
    }
    const newId = `T-0${tourList.length + 1}`;
    MULTI_LANG_TOURS[newId] = {
      vi: newTourName,
      en: newTourName,
      zh: newTourName,
      ja: newTourName,
      ko: newTourName
    };
    const createdTour = {
      id: newId,
      poiCount: poiList.length,
      isRawActive: false,
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

    setTotalStreams(prev => {
      const nextCount = prev + 1;
      localStorage.setItem('tourist_total_streams', nextCount.toString());
      return nextCount;
    });

    const currentScript = MULTI_LANG_SCRIPTS[item.id]?.[currentLang] || MULTI_LANG_SCRIPTS['P-01']['vi'];
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
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  {t.savePoiBtn}
                </button>
              </div>

              {/* List of POIs */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: 0, marginBottom: '16px' }}>{t.poiListTitle} ({poiList.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {poiList.map((item) => {
                    const currentName = MULTI_LANG_NAMES[item.id]?.[currentLang] || MULTI_LANG_NAMES['P-01']['vi'];
                    const currentScript = MULTI_LANG_SCRIPTS[item.id]?.[currentLang] || MULTI_LANG_SCRIPTS['P-01']['vi'];

                    return (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#F8FAFC' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '280px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>{item.id}</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{currentName}</span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>{t.coordsLabel}: {item.latitude}, {item.longitude}</span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#475569', flex: 1, margin: '0 20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {currentScript}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedPoiForQR({ ...item, name: currentName })}
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
                    );
                  })}
                </div>
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
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563EB' }}>{activeUsersCount}</div>
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
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '6px' }}>{MULTI_LANG_NAMES['P-01']?.[currentLang] || 'Cổng Tam Quan'}</div>
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
                    const name = MULTI_LANG_NAMES[poi.id]?.[currentLang] || MULTI_LANG_NAMES['P-01']['vi'];

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
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>{poi.id}: {name}</span>
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
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=poi://${selectedPoiForQR.id}`}
                alt="QR Code"
              />
            </div>

            <div style={{ fontSize: '12px', color: '#334155', marginBottom: '4px' }}>{t.poiCodeLabel}: <span style={{ fontWeight: 700, color: '#2563EB' }}>{selectedPoiForQR.id}</span></div>
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