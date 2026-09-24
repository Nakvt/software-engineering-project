export interface POI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  region: string;
  script: string;
  imageUrl?: string;
  priority?: number;
}

export const MOCK_POIS: POI[] = [
  {
    id: 'POI-01',
    name: 'Cổng Tam Quan - Chùa Linh Ứng Bãi Bụt',
    latitude: 16.1002,
    longitude: 108.2781,
    radius: 30,
    region: 'Bắc (TTS)',
    script: 'Cổng Tam Quan là cổng dẫn lối vào khuôn viên Chùa Linh Ứng Bãi Bụt, mang kiến trúc truyền thống với các mái vòm cổ kính.',
    priority: 1,
  },
  {
    id: 'POI-02',
    name: 'Chính Điện - Chùa Linh Ứng Bãi Bụt',
    latitude: 16.1008,
    longitude: 108.2785,
    radius: 50,
    region: 'Bắc (TTS)',
    script: 'Chính điện được xây bằng mái ngói uốn cong hình rồng, nơi thờ Phật Thích Ca Mâu Ni cùng các vị Bồ Tát.',
    priority: 2,
  },
  {
    id: 'POI-03',
    name: 'Tượng Quán Thế Âm Bồ Tát 67m',
    latitude: 16.1012,
    longitude: 108.2790,
    radius: 60,
    region: 'Trung (TTS)',
    script: 'Tượng Quán Thế Âm cao 67m, đứng tựa lưng vào núi, hướng ra biển Đông. Đây là một trong những bức tượng Phật cao nhất Việt Nam.',
    priority: 3,
  },
];

export const MOCK_ANALYTICS = {
  totalStreams: 1250,
  avgDurationMinutes: 4.5,
  topPoi: 'Tượng Quán Thế Âm Bồ Tát 67m',
};
