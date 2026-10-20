import { createContext } from 'react';
import type { AdminUser, AuthResponseData } from '../../domain/models/auth';

export interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponseData) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);