import { apiClient } from './apiClient';
import { Tour } from '../models/Tour';
import { MOCK_TOURS } from '../models/mockTour';

export const tourService = {
  async getAllTours(): Promise<Tour[]> {
    try {
      // Bỏ /api/v1 vì apiClient đã có sẵn baseURL
      const response = await apiClient.get('/tours');
      console.log('🌐 [API Tour Response]:', response.data);

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('✅ [API] Lấy danh sách Tours từ Backend thành công');
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return MOCK_TOURS;
    } catch (error) {
      console.warn('⚠️ [API Fallback] Lỗi kết nối API Tour, Dùng Mock Tours thay thế.', error);
      return MOCK_TOURS;
    }
  },

  async getTourById(id: string): Promise<Tour | null> {
    try {
      // Bỏ /api/v1 và dùng dấu backtick ` `
      const response = await apiClient.get(`/tours/${id}`);

      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }

      if (response.data && response.data.id) {
        return response.data;
      }

      return MOCK_TOURS.find((t) => t.id === id) || null;
    } catch (error) {
      console.warn(`⚠️ [API Fallback] Lỗi kết nối API Tour ID ${id}, fallback Mock.`, error);
      return MOCK_TOURS.find((t) => t.id === id) || null;
    }
  },
};