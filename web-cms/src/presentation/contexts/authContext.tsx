import React, { useState } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser, AuthResponseData } from '../../domain/models/auth';
import { authStorage } from '../../data/storage/authStorage';
import { authApi } from '../../data/api/authApi';
import { AuthContext } from './AuthContextType';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const savedUser = authStorage.getUser();
    const token = authStorage.getAccessToken();
    return savedUser && token ? savedUser : null;
  });

  const [isLoading] = useState<boolean>(false);

  const login = (authData: AuthResponseData) => {
    authStorage.setSession(authData.accessToken, authData.refreshToken, authData.user);
    setUser(authData.user);
  };

  const logout = async () => {
    const refreshToken = authStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (err) {
        console.error('Lỗi khi đăng xuất:', err);
      }
    }
    authStorage.clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};