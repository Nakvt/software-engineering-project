import { Tour } from './Tour';

export const MOCK_TOURS: Tour[] = [
  {
    id: 'tour-1',
    name: 'Hành Trình Di Sản Bái Đính',
    description: 'Khám phá trọn vẹn các công trình kiến trúc Phật giáo tiêu biểu nhất.',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80',
    durationMinutes: 45,
    distanceKm: 1.2,
    poiIds: [
      'a12deb4d-1c2d-3ef4-5a6b-7c8d9e0f1a2b', // Cổng Tam Quan
      'b34deb4d-9f8e-7d6c-5b4a-3e2d1c0b9a8f', // Tháp Chuông
      '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', // Chánh Điện
    ],
  },
  {
    id: 'tour-2',
    name: 'Tour Khám Phá Nhanh',
    description: 'Dành cho du khách có thời gian ngắn, tập trung vào điểm nhấn Chánh Điện.',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80',
    durationMinutes: 20,
    distanceKm: 0.5,
    poiIds: ['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'],
  },
];