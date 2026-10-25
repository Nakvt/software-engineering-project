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
    // Phiên đăng nhập mock không có JWT thật; gọi API sẽ bị 401 và làm interceptor đẩy về /login.
    if (authStorage.getAccessToken()?.startsWith('mock_')) {
      throw new Error(MOCK_SESSION_ERROR);
    }

    const response = await apiClient.get<ApiResponse<OnlineSessionsData>>(
      '/admin/analytics/online-sessions',
    );
    const body = response.data;
    if (!body.success || !body.data || typeof body.data.onlineSessions !== 'number') {
      throw new Error(body.error ?? 'Invalid online sessions response');
    }
    return body.data;
  },
};
