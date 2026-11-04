import apiClient from './apiClient';
import { authStorage } from '../storage/authStorage';
import type { ApiResponse } from '../../domain/models/auth';

export interface OnlineSessionsData {
  onlineSessions: number;
  windowMinutes: number;
  asOf: string;
}

export const MOCK_SESSION_ERROR = 'MOCK_SESSION';

export const analyticsApi = {
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
    } catch (error: unknown) { // 👈 Sửa error: any thành error: unknown
      // Kiểm tra nếu đang dùng token mock thì fallback an toàn cho UI render
      if (token?.startsWith('mock_')) {
        console.warn('⚠️ [Web CMS Analytics] Đang sử dụng Mock Token, tự động Fallback dữ liệu Online Sessions');
        return {
          onlineSessions: 0,
          windowMinutes: 5,
          asOf: new Date().toISOString(),
        };
      }

      // Đẩy lỗi tiếp tục lên UI handler
      throw error;
    }
  },
};