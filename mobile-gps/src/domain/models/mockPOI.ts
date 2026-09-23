import { POI } from './POI';

export const MOCK_POIS: POI[] = [
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    code: 'POI_CHANHDIEN_01',
    name: 'Chánh Điện Chùa Bái Đính',
    location: {
      lat: 16.099123,
      lng: 108.277456,
    },
    radius: 20,
    priority: 10,
    cooldownSeconds: 300,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
    audio: {
      audioUrl: 'https://cdn.example.com/audio/cd_vi_central.mp3',
      ttsScript: 'Chào mừng bạn đến với Chánh Điện. Đây là nơi trang nghiêm nhất trong khuôn viên.',
      duration: 95,
    },
  },
  {
    id: 'a12deb4d-1c2d-3ef4-5a6b-7c8d9e0f1a2b',
    code: 'POI_TAMQUAN_02',
    name: 'Cổng Tam Quan',
    location: {
      lat: 16.0995,
      lng: 108.2778,
    },
    radius: 25,
    priority: 8,
    cooldownSeconds: 300,
    imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=600&auto=format&fit=crop&q=80',
    audio: {
      audioUrl: 'https://cdn.example.com/audio/tq_vi_central.mp3',
      ttsScript: 'Bạn đang đứng trước Cổng Tam Quan, điểm khởi đầu cho hành trình tham quan.',
      duration: 180,
    },
  },
  {
    id: 'b34deb4d-9f8e-7d6c-5b4a-3e2d1c0b9a8f',
    code: 'POI_THAPCHUONG_03',
    name: 'Tháp Chuông',
    location: {
      lat: 16.0988,
      lng: 108.277,
    },
    radius: 20,
    priority: 6,
    cooldownSeconds: 300,
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80',
    audio: {
      audioUrl: 'https://cdn.example.com/audio/tc_vi_central.mp3',
      ttsScript: 'Trước mắt bạn là Tháp Chuông bát giác, nơi đặt chiếc đại hồng chung nặng 36 tấn.',
      duration: 150,
    },
  },
];