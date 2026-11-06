import apiClient from './apiClient';
import { authStorage } from '../storage/authStorage';
import type { ApiResponse } from '../../domain/models/auth';

export interface OnlineSessionsData {
  onlineSessions: number;
  windowMinutes: number;
  asOf: string;
}

export interface HeatmapPoint {
  id?: string;
  name?: string;
  lat: number;
  lng: number;
  weight: number;
}

export interface DashboardStats {
  totalStreams: number;
  avgDurationMinutes: number;
  topPoiName: string;
}

// Kiểu dữ liệu bổ trợ cho bóc tách Response từ Backend
type RawHeatmapItem =
  | [number, number, number?]
  | { id?: string; name?: string; latitude?: number; lat?: number; longitude?: number; lng?: number; weight?: number };

interface RawTopPoiItem {
  id?: string;
  name?: string;
  totalListens?: number;
  avgDurationSeconds?: number;
}

export const MOCK_SESSION_ERROR = 'MOCK_SESSION';

export const analyticsApi = {
  // 1. Lấy số lượng phiên Online thời gian thực (5 phút)
  getOnlineSessions: async (): Promise<OnlineSessionsData> => {
    const token = authStorage.getAccessToken();

    try {
      const response = await apiClient.get<ApiResponse<OnlineSessionsData>>(
        '/admin/analytics/online-sessions',
      );

      const body = response.data;

      if (body && body.success && body.data && typeof body.data.onlineSessions === 'number') {
        return body.data;
      }

      throw new Error(body?.error ?? 'Invalid online sessions response format');
    } catch (error: unknown) {
      if (token?.startsWith('mock_')) {
        console.warn('⚠️ [Web CMS Analytics] Đang sử dụng Mock Token, tự động Fallback dữ liệu Online Sessions');
        return {
          onlineSessions: 0,
          windowMinutes: 5,
          asOf: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  // 2. Lấy dữ liệu Spatial Heatmap thực tế từ CSDL
  getHeatmapData: async (): Promise<HeatmapPoint[]> => {
    try {
      const response = await apiClient.get('/admin/analytics/heatmap');
      const body = response.data;
      const rawData = body && body.success ? body.data : body;

      if (Array.isArray(rawData)) {
        return rawData.map((item: RawHeatmapItem) => {
          // Backend trả về dạng mảng [lat, lng, weight]
          if (Array.isArray(item)) {
            return {
              lat: Number(item[0]),
              lng: Number(item[1]),
              weight: Number(item[2] || 1),
            };
          }
          // Trường hợp trả về dạng Object { id, name, latitude, longitude, weight }
          return {
            id: item.id,
            name: item.name,
            lat: Number(item.latitude || item.lat || 0),
            lng: Number(item.longitude || item.lng || 0),
            weight: Number(item.weight || 1),
          };
        });
      }
      return [];
    } catch (error: unknown) {
      console.error('Lỗi tải dữ liệu Spatial Heatmap:', error);
      return [];
    }
  },

  // 3. Lấy thống kê Dashboard thật (Top POI & Thời lượng nghe)
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/admin/analytics/dashboard');
      const body = response.data;
      const data = body && body.success ? body.data : body;

      // Ưu tiên đọc kết quả tổng hợp trực tiếp từ Backend
      if (
        data &&
        typeof data.totalStreams === 'number' &&
        typeof data.avgDurationMinutes === 'number'
      ) {
        return {
          totalStreams: data.totalStreams,
          avgDurationMinutes: data.avgDurationMinutes,
          topPoiName: data.topPoiName || '—',
        };
      }

      // Fallback: Tính toán từ mảng topPois nếu Backend trả dạng legacy
      const topPois: RawTopPoiItem[] = data?.topPois || [];
      const topPoi = topPois[0];

      const totalStreams = topPois.reduce(
        (sum: number, item: RawTopPoiItem) => sum + (item.totalListens || 0),
        0
      );

      const avgDurationMinutes = topPoi
        ? Math.round(((topPoi.avgDurationSeconds || 0) / 60) * 10) / 10
        : 0;

      return {
        totalStreams,
        avgDurationMinutes,
        topPoiName: topPoi?.name || 'Chưa có dữ liệu',
      };
    } catch (error: unknown) {
      console.error('Lỗi tải thống kê Dashboard:', error);
      return {
        totalStreams: 0,
        avgDurationMinutes: 0,
        topPoiName: '—',
      };
    }
  },
};