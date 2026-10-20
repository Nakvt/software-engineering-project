import apiClient from './apiClient';
import type { ApiResponse, AuthResponseData } from '../../domain/models/auth';

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout', { refreshToken });
    return response.data;
  },
};