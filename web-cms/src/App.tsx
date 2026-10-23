import { useState } from 'react';
import LoginPage from './presentation/pages/login/loginPage';
import { AdminDashboardScreen } from './presentation/screens/AdminDashboardScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboardScreen onLogout={() => setIsLoggedIn(false)} />;
}