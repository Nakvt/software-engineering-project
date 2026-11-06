import { apiClient } from './apiClient';
import { POI } from '../models/POI';
import { MOCK_POIS } from '../models/mockPOI';

export interface TrackingPingResponse {
  shouldTrigger: boolean;
  poi: POI | null;
}

export const poiService = {
  /**
   * 1. Lấy danh sách toàn bộ POI từ Backend theo ngôn ngữ được chọn
   * API: GET /api/v1/pois?lang=vi|en|ja|zh|ko
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
   * 2. Lấy chi tiết 1 POI qua mã QR Code theo ngôn ngữ
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
      const found = MOCK_POIS.find((p: POI) => p.code === code || p.id === code);
      return found || null;
    }
  },

  /**
   * Lấy chi tiết 1 POI qua ID theo ngôn ngữ
   * API: GET /api/v1/pois/:id?lang=vi|en|ja|zh|ko
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

  /**
   * 🟢 API THỨ 3: Gửi tọa độ GPS thời gian thực & kiểm tra Geofence Trigger
   * API: POST /api/v1/tracking/ping
   */
  async sendTrackingPing(
    sessionId: string,
    latitude: number,
    longitude: number,
    lang: string = 'vi'
  ): Promise<TrackingPingResponse> {
    try {
      const response = await apiClient.post<any>('/tracking/ping', {
        sessionId,
        latitude,
        longitude,
        lang, // 👈 RÚT KINH NGHIỆM: Luôn gửi kèm lang động để Backend trả về đúng ttsScript
      });

      const result = response.data?.data || response.data;

      return {
        shouldTrigger: Boolean(result?.shouldTrigger),
        poi: result?.poi || null,
      };
    } catch (error) {
      console.error('❌ [API Tracking Ping Error]:', error);
      return {
        shouldTrigger: false,
        poi: null,
      };
    }
  },

  /**
   * 🟢 API THỨ 4: Ghi nhận nhật ký nghe thuyết minh về Backend Analytics
   * API: POST /api/v1/analytics/listen-event
   */
  async logListenEvent(data: {
    sessionId: string;
    poiId: string;
    triggerType?: 'geofence' | 'qr_code' | 'manual';
    durationListenedSeconds?: number;
    completed?: boolean;
  }): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/analytics/listen-event', {
        sessionId: data.sessionId,
        poiId: data.poiId,
        triggerType: data.triggerType || 'geofence',
        durationListenedSeconds: data.durationListenedSeconds || 0,
        completed: Boolean(data.completed),
      });

      return Boolean(response.data?.success);
    } catch (error) {
      console.warn('⚠️ [Analytics Log Warning]:', error);
      return false;
    }
  },
};