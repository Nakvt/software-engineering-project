import apiClient from './apiClient';

export interface CreatePoiPayload {
  code: string;
  name: string;
  location: { lat: number; lng: number };
  radius: number;
  priority?: number;
  cooldownSeconds?: number;
  imageUrl?: string;
  content: {
    languageCode: string;
    accent?: string;
    title: string;
    description?: string;
    ttsScript?: string;
    audioUrl?: string;
    audioDurationSeconds?: number;
  };
}

export const poiApi = {
  // 💡 Lấy danh sách POI từ Postgres DB
  getPois: async () => {
    const res = await apiClient.get('/pois');
    // Bóc tách envelope chuẩn { success: true, data: [...] }
    return res.data.success ? res.data.data : res.data;
  },

  // 💡 Thêm POI mới vào Postgres DB
  createPoi: async (payload: CreatePoiPayload) => {
    const res = await apiClient.post('/admin/pois', payload);
    return res.data.success ? res.data.data : res.data;
  },
};