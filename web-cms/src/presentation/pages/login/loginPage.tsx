import React, { useState } from 'react';
import styles from './loginPage.module.css';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (username.trim() && password.trim()) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Bên trái: Panel banner xanh đậm với họa tiết */}
        <div className={styles.leftPanel}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
          <div className={styles.welcomeText}>
            <p className={styles.subTitle}>Hello!</p>
            <h1 className={styles.title}>
              Have a <br />
              <span>GOOD DAY</span>
            </h1>
          </div>
        </div>

        {/* Bên phải: Form Đăng nhập thuần túy */}
        <div className={styles.rightPanel}>
          <div className={styles.decorativeCircleTop}></div>
          <div className={styles.decorativeCircleSmall}></div>

          <h2 className={styles.formTitle}>Login</h2>

          {errorMessage && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '15px', textAlign: 'center', fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className={styles.forgotPass}>
              <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>

            <button type="submit" className={styles.loginBtn}>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;