import { useState } from 'react';
import LoginPage from './presentation/pages/login/loginPage';
import { AdminDashboardScreen } from './presentation/screens/AdminDashboardScreen';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <AdminDashboardScreen onLogout={() => setIsLoggedIn(false)} />
      )}
    </>
  );
}

export default App;