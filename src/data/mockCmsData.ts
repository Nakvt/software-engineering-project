export interface POI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // bán kính Geofence (m)
  audioUrl: string;
  region: 'Bắc' | 'Trung' | 'Nam';
}

export const MOCK_POIS: POI[] = [
  {
    id: 'poi-1',
    name: 'Chánh Điện Chùa Bái Đính',
    latitude: 20.2741,
    longitude: 105.8342,
    radius: 20,
    audioUrl: 'https://example.com/audio1.mp3',
    region: 'Bắc',
  },
  {
    id: 'poi-2',
    name: 'Cổng Tam Quan',
    latitude: 20.2750,
    longitude: 105.8350,
    radius: 15,
    audioUrl: 'https://example.com/audio2.mp3',
    region: 'Bắc',
  },
];

export const MOCK_ANALYTICS = {
  totalStreams: 1240,
  avgDurationMinutes: 3.5,
  topPoi: 'Chánh Điện Chùa Bái Đính',
};
