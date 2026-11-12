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

export interface UpdatePoiPayload {
  name?: string;
  description?: string;
  radius?: number;
  radius_meters?: number;
  name_default?: string;
  description_default?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    lat: number;
    lng: number;
  };
  audio_url?: string;
  image_url?: string;
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

  deletePoi: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/pois/${id}`);
  },
  updatePoi: async (id: string, data: UpdatePoiPayload) => {
      try {
        console.log(`🌐 [poiApi] Đang gửi PUT request tới /admin/pois/${id}`);
        const response = await apiClient.put(`/admin/pois/${id}`, data);
        
        // Nếu response trả về rỗng hoặc undefined thì không crash
        if (!response || !response.data) {
          return { success: true };
        }
        
        return response.data;
      } catch (error) {
        console.error(`❌ [poiApi.updatePoi] Lỗi khi cập nhật POI (ID: ${id}):`, error);
        throw error;
      }
    },
};