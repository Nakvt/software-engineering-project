import { apiClient } from './apiClient';
import { Tour } from '../models/Tour';
import { MOCK_TOURS } from '../models/mockTour';

export const tourService = {
  /**
   * Lấy danh sách các lộ trình Tour tham quan
   */
  async getAllTours(): Promise<Tour[]> {
    try {
      const response = await apiClient.get<Tour[]>('/tours');
      console.log(' [API] Lấy danh sách Tours từ Backend thành công');
      return response.data;
    } catch (error) {
      console.warn('⚠️ [API Fallback] Dùng Mock Tours thay thế.');
      return MOCK_TOURS;
    }
  },
};