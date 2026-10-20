import type { AdminUser } from '../../domain/models/auth';

const ACCESS_TOKEN_KEY = 'cms_access_token';
const REFRESH_TOKEN_KEY = 'cms_refresh_token';
const USER_INFO_KEY = 'cms_user_info';

export const authStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUser: (): AdminUser | null => {
    const userStr = localStorage.getItem(USER_INFO_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  setSession: (accessToken: string, refreshToken: string, user?: AdminUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (user) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    }
  },
  setAccessToken: (accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },
  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  },
};