import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authStorage } from '../storage/authStorage';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag & Queue chống Race Condition khi refresh token đồng thời
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Giải phóng các request bị hoãn trong hàng đợi
 */
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// Helper gắn Authorization header an toàn cho cả Axios v0.x và v1.x
const setAuthHeader = (config: InternalAxiosRequestConfig, token: string): void => {
  if (!config.headers) return;
  if (typeof config.headers.set === 'function') {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
};

// Request Interceptor: Tự động đính kèm Access Token vào mọi Request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token) {
      setAuthHeader(config, token);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Xử lý tự động refresh token khi gặp 401 Unauthorized
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const requestUrl = originalRequest?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh-token');

    // Xử lý khi nhận lỗi 401 và không phải các API Authentication gốc
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      // Nếu đang trong tiến trình refresh token từ request khác -> Xếp vào hàng đợi
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            setAuthHeader(originalRequest, newToken);
            return apiClient(originalRequest);
          })
          .catch((err: unknown) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (res.data.success && res.data.data?.accessToken) {
            const newAccessToken: string = res.data.data.accessToken;

            authStorage.setAccessToken(newAccessToken);
            setAuthHeader(originalRequest, newAccessToken);

            processQueue(null, newAccessToken);

            return apiClient(originalRequest);
          } else {
            throw new Error('Dữ liệu cấp lại token không hợp lệ');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          authStorage.clearSession();

          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Trường hợp không có refreshToken
        isRefreshing = false;
        authStorage.clearSession();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;