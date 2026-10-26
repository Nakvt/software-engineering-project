import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import styles from './loginPage.module.css';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);

      // --- GIẢ LẬP KẾT NỐI API (MOCK DATA) ---
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (username === 'admin' && password === '123456') {
        const mockAuthData = {
          accessToken: 'mock_access_token_123456',
          refreshToken: 'mock_refresh_token_abcdef',
          expiresIn: 900,
          user: {
            id: 'admin-01',
            username: 'admin',
            fullName: 'Quản Trị Viên (Mock)',
            role: 'super_admin' as const,
          },
        };

        login(mockAuthData);

        if (onLoginSuccess) {
          onLoginSuccess();
        }

        navigate('/dashboard', { replace: true });
      } else {
        setErrorMessage('Tên đăng nhập hoặc mật khẩu không đúng (Thử: admin / 123456)');
      }
      // ----------------------------------------
    } catch {
      setErrorMessage('Đã xảy ra lỗi không xác định.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
        <h1 className={styles.greeting}>Hello!</h1>
        <h2 className={styles.mainText}>
          Have a<br />GOOD DAY
        </h2>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.rightDecor}></div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.topIcon}></div>
          <h2 className={styles.formTitle}>Login</h2>

          {errorMessage && <div className={styles.errorBanner}>{errorMessage}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., admin"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <a href="#forgot" className={styles.forgotPassword} onClick={(e) => e.preventDefault()}>
            forgot password?
          </a>

          <button type="submit" className={styles.loginButton} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;