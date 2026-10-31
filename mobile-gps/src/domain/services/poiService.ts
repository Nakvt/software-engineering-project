import { apiClient } from './apiClient';
import { POI } from '../models/POI';
import { MOCK_POIS } from '../models/mockPOI';

export const poiService = {
  /**
   * Lấy danh sách toàn bộ POI từ Backend theo ngôn ngữ được chọn
   */
  async getAllPOIs(lang: string = 'vi'): Promise<POI[]> {
    try {
      const response = await apiClient.get<any>('/pois', {
        params: { lang },
      });
      const rawData = response.data;
      if (Array.isArray(rawData)) return rawData;
      if (rawData && Array.isArray(rawData.data)) return rawData.data;
      return MOCK_POIS;
    } catch (error) {
      console.warn('⚠️ [API Fallback] Dùng Mock POIs thay thế.');
      return MOCK_POIS;
    }
  },

  /**
   * Lấy chi tiết 1 POI qua mã QR Code theo ngôn ngữ
   */
  async getPOIByCode(code: string, lang: string = 'vi'): Promise<POI | null> {
    try {
      const response = await apiClient.get<any>(`/pois/by-code/${code}`, {
        params: { lang },
      });
      const rawData = response.data;
      return rawData?.data || rawData || null;
    } catch (error) {
      const found = MOCK_POIS.find((p: POI) => p.code === code || p.id === code);
      return found || null;
    }
  },

  /**
   * 🟢 THÊM HÀM NÀY ĐỂ TRÁNH LỖI CI TYPE CHECK
   * Lấy chi tiết 1 POI qua ID theo ngôn ngữ
   */
  async getPOIById(id: string, lang: string = 'vi'): Promise<POI | null> {
    try {
      const response = await apiClient.get<any>(`/pois/${id}`, {
        params: { lang },
      });
      const rawData = response.data;
      return rawData?.data || rawData || null;
    } catch (error) {
      const found = MOCK_POIS.find((p: POI) => p.id === id || p.code === id);
      return found || null;
    }
  },
};