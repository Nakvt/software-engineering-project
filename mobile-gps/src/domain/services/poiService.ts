import { apiClient } from './apiClient';
import { POI } from '../models/POI';
import { MOCK_POIS } from '../models/mockPOI';

export const poiService = {
  /**
   * Lấy danh sách toàn bộ POI từ Backend theo ngôn ngữ được chọn
   * API: GET /api/v1/pois?lang=vi|en|ja|zh|ko
   */
  async getAllPOIs(lang: string = 'vi'): Promise<POI[]> {
    try {
      const response = await apiClient.get<any>('/pois', {
        params: { lang },
      });
      console.log(`🟢 [API] Lấy danh sách POIs (Ngôn ngữ: ${lang}) thành công`);

      const rawData = response.data;
      if (Array.isArray(rawData)) {
        return rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        return rawData.data;
      }
      return MOCK_POIS;
    } catch (error) {
      console.error('❌ [LỖI GỌI API POIS]:', error);
      console.warn('⚠️ [API Fallback] Không kết nối được Backend, dùng Mock POIs thay thế.');
      return MOCK_POIS;
    }
  },

  /**
   * Lấy chi tiết 1 POI qua mã QR Code theo ngôn ngữ
   * API: GET /api/v1/pois/by-code/:code?lang=vi|en|ja|zh|ko
   */
  async getPOIByCode(code: string, lang: string = 'vi'): Promise<POI | null> {
    try {
      const response = await apiClient.get<any>(`/pois/by-code/${code}`, {
        params: { lang },
      });
      const rawData = response.data;
      return rawData?.data || rawData || null;
    } catch (error) {
      console.warn(`⚠️ [API Fallback] Tìm kiếm POI ${code} trên Mock Data.`);
      const found = MOCK_POIS.find((p: POI) => p.code === code || p.id === code);
      return found || null;
    }
  },
};