import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SessionService } from '../../domain/services/sessionService';

const HEARTBEAT_INTERVAL_MS = 60000;

export const useOnlineSession = () => {
  // Sửa lỗi NodeJS.Timeout bằng ReturnType<typeof setInterval>
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  /**
   * Dừng bộ đếm Timer Heartbeat an toàn
   */
  const stopHeartbeatTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /**
   * Khởi động bộ đếm Timer Heartbeat
   */
  const startHeartbeatTimer = () => {
    stopHeartbeatTimer();

    timerRef.current = setInterval(async () => {
      const sessionId = SessionService.getSessionId();

      if (!sessionId) {
        await initSessionFlow();
      } else {
        const success = await SessionService.sendHeartbeat();
        if (!success && !SessionService.getSessionId()) {
          await initSessionFlow();
        }
      }
    }, HEARTBEAT_INTERVAL_MS);
  };

  /**
   * Luồng khởi tạo hoặc khôi phục phiên online
   */
  const initSessionFlow = async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    try {
      let sessionId = SessionService.getSessionId();
      if (!sessionId) {
        sessionId = await SessionService.createSession();
      }

      if (sessionId) {
        await SessionService.sendHeartbeat();
        startHeartbeatTimer();
      }
    } finally {
      isInitializingRef.current = false;
    }
  };

  useEffect(() => {
    initSessionFlow();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 [AppState] App đã quay lại Foreground. Kiểm tra phiên online...');
        await initSessionFlow();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('📱 [AppState] App đã xuống Background. Tạm dừng Timer heartbeat.');
        stopHeartbeatTimer();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopHeartbeatTimer();
      subscription.remove();
    };
  }, []);
};