import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './presentation/contexts/authContext';
import { ProtectedRoute } from './presentation/components/protectedRoute';
import LoginPage from './presentation/pages/login/loginPage';
import { AdminDashboardScreen } from './presentation/screens/AdminDashboardScreen';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Route công khai: Trang Đăng nhập */}
          <Route path="/login" element={<LoginPage />} />

          {/* 2. Route bảo vệ: Chỉ cho phép truy cập khi đã đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AdminDashboardScreen />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* 3. Catch-all Route: Tự động điều hướng về /login nếu gõ URL không tồn tại */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;