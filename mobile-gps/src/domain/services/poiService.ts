import { apiClient } from './apiClient';
import { POI } from '../models/POI';
import { MOCK_POIS } from '../models/mockPOI';

export const poiService = {
  /**
   * Lấy danh sách toàn bộ các điểm di tích POI
   */
  async getAllPOIs(): Promise<POI[]> {
    try {
      const response = await apiClient.get<POI[]>('/pois');
      console.log(' [API] Lấy danh sách POIs từ Backend thành công');
      return response.data;
    } catch (error) {
      console.warn('⚠️ [API Fallback] Không kết nối được Backend, dùng Mock POIs thay thế.');
      return MOCK_POIS;
    }
  },

  /**
   * Lấy chi tiết 1 POI qua ID hoặc mã QR
   * Dùng cho tính năng quét mã QR hiện vật
   */
  async getPOIById(idOrQrCode: string): Promise<POI | null> {
    try {
      const response = await apiClient.get<POI>(`/pois/${idOrQrCode}`);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ [API Fallback] Tìm kiếm POI ${idOrQrCode} trên Mock Data.`);
      // Thêm kiểu rõ ràng (p: POI) để hết lỗi implicit any
      const found = MOCK_POIS.find((p: POI) => p.id === idOrQrCode || p.code === idOrQrCode);
      return found || null;
    }
  },
};