export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'editor';
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AdminUser;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
}