import { POI } from './POI';

export const MOCK_POIS: POI[] = [
  {
    id: 'poi-1',
    code: 'BAI_DINH_MAIN_HALL',
    name: 'Chánh Điện Chùa Bái Đính',
    description: 'Chánh điện nguy nga tráng lệ với tượng Phật Thích Ca bằng đồng dát vàng.',
    location: {
      lat: 16.099123,
      lng: 108.277456,
    },
    radius: 20,
    priority: 1,
    cooldownSeconds: 300,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
    audio: {
      languageCode: 'vi',
      accent: 'north',
      ttsScript: 'Chào mừng bạn đến với Chánh Điện. Đây là nơi trang nghiêm nhất trong khuôn viên.',
      duration: 210,
    },
  },
  {
    id: 'poi-2',
    code: 'BAI_DINH_GATE',
    name: 'Cổng Tam Quan',
    description: 'Cổng vào bề thế với kiến trúc thuần Việt truyền thống.',
    location: {
      lat: 16.0995,
      lng: 108.2778,
    },
    radius: 25,
    priority: 2,
    cooldownSeconds: 300,
    imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=600&auto=format&fit=crop&q=80',
    audio: {
      languageCode: 'vi',
      accent: 'north',
      ttsScript: 'Bạn đang đứng trước Cổng Tam Quan, điểm khởi đầu cho hành trình tham quan.',
      duration: 180,
    },
  },
  {
    id: 'poi-3',
    code: 'BAI_DINH_BELL_TOWER',
    name: 'Tháp Chuông',
    description: 'Nơi lưu giữ quả chuông đồng lớn nhất Việt Nam.',
    location: {
      lat: 16.0988,
      lng: 108.277,
    },
    radius: 20,
    priority: 3,
    cooldownSeconds: 300,
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80',
    audio: {
      languageCode: 'vi',
      accent: 'north',
      ttsScript: 'Trước mắt bạn là Tháp Chuông bát giác, nơi đặt chiếc đại hồng chung nặng 36 tấn.',
      duration: 150,
    },
  },
];