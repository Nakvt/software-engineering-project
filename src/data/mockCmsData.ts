export interface POIItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  region: string;
  script: string;
  audioUrl?: string;
  imageUrl?: string;
}

export const MOCK_POIS: POIItem[] = [
  {
    id: 'poi-01',
    name: 'Cổng Tam Quan Chùa Linh Ứng Bãi Bụt',
    latitude: 16.1002,
    longitude: 108.2778,
    radius: 20,
    region: 'Bắc (TTS)',
    script: 'Cổng Tam Quan là cổng dẫn lối vào khuôn viên chùa Linh Ứng Bãi Bụt, được thiết kế theo lối kiến trúc cổ...',
    imageUrl: 'https://chualinhung.vn/images/tam-quan.jpg',
  },
  {
    id: 'poi-02',
    name: 'Tòa Chính Điện (Điện Đại Hùng)',
    latitude: 16.1006,
    longitude: 108.2781,
    radius: 25,
    region: 'Bắc (TTS)',
    script: 'Chính điện được xây bằng mái ngói uốn cong hình rồng, thờ Phật Thích Ca Mâu Ni ở giữa...',
    imageUrl: 'https://chualinhung.vn/images/chinh-dien.jpg',
  },
  {
    id: 'poi-03',
    name: 'Tượng Phật Quán Thế Âm (Cao 67m)',
    latitude: 16.0998,
    longitude: 108.2775,
    radius: 30,
    region: 'Trung (TTS)',
    script: 'Tượng Quán Thế Âm cao 67m, đứng tựa lưng vào núi Sơn Trà, hướng ra biển Đông...',
    imageUrl: 'https://chualinhung.vn/images/tuong-quan-am.jpg',
  },
  {
    id: 'poi-04',
    name: 'Tháp Xá Lợi',
    latitude: 16.1009,
    longitude: 108.2785,
    radius: 15,
    region: 'Bắc (TTS)',
    script: 'Tháp Xá Lợi cao 9 tầng, là nơi thờ các pho tượng Phật và xá lợi Phật linh thiêng...',
    imageUrl: 'https://chualinhung.vn/images/thap-xa-loi.jpg',
  },
  {
    id: 'poi-05',
    name: 'Vườn Lâm Tỳ Ni (Lumbini)',
    latitude: 16.1012,
    longitude: 108.2788,
    radius: 20,
    region: 'Nam (TTS)',
    script: 'Vườn Lâm Tỳ Ni mô phỏng lại nơi Đức Phật Thích Ca Mâu Ni đản sinh...',
    imageUrl: 'https://chualinhung.vn/images/lam-ty-ni.jpg',
  },
];

export const MOCK_ANALYTICS = {
  totalStreams: 2450,
  avgDurationMinutes: 4.2,
  topPoi: 'Tượng Phật Quán Thế Âm (Cao 67m)',
};
