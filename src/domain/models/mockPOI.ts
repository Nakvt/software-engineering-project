import { POI } from './POI';

export const MOCK_POIS: POI[] = [
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    code: 'POI_CHANHDIEN_01',
    name: 'Chánh Điện',
    location: {
      lat: 16.099123,
      lng: 108.277456,
    },
    radius: 20,
    priority: 10,
    cooldownSeconds: 300, // 5 phút chống spam
    imageUrl: 'https://cdn.example.com/chanhdien.jpg',
    audio: {
      audioUrl: 'https://cdn.example.com/audio/cd_vi_central.mp3',
      ttsScript: 'Chào mừng bạn đến với Chánh Điện. Đây là nơi trang nghiêm nhất trong khuôn viên.',
      duration: 95,
    },
  },
  {
    id: 'e2a87b1c-5d3f-42a1-89e4-3c1a2d4f5e6a',
    code: 'POI_CONGTAMQUAN_02',
    name: 'Cổng Tam Quan',
    location: {
      lat: 16.098850,
      lng: 108.276900,
    },
    radius: 15,
    priority: 5,
    cooldownSeconds: 300,
    imageUrl: 'https://cdn.example.com/tamquan.jpg',
    audio: {
      ttsScript: 'Bạn đang đứng trước Cổng Tam Quan, lối dẫn chính vào khu di tích với kiến trúc ba cổng truyền thống.',
      duration: 45,
    },
  },
  {
    id: 'f4c92a3e-7a1b-43d9-92c1-1e2f3a4b5c6d',
    code: 'POI_VUONTHOAI_03',
    name: 'Vườn Tịnh Tâm',
    location: {
      lat: 16.099500,
      lng: 108.277900,
    },
    radius: 15,
    priority: 3,
    cooldownSeconds: 180,
    audio: {
      ttsScript: 'Khu vườn râm mát với nhiều cây xanh cổ thụ thích hợp để du khách dừng chân nghỉ ngơi.',
      duration: 30,
    },
  },
];