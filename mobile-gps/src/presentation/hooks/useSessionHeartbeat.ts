import { useEffect } from 'react';
import { AppState } from 'react-native';
import { sessionService } from '../../domain/services/sessionService';

export const HEARTBEAT_INTERVAL_MS = 60_000;

export function useSessionHeartbeat(): void {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer !== null) return;
      void sessionService.beat();
      timer = setInterval(() => void sessionService.beat(), HEARTBEAT_INTERVAL_MS);
    };

    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };

    if (AppState.currentState === 'active') start();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') start();
      else stop();
    });

    return () => {
      subscription.remove();
      stop();
      sessionService.reset();
    };
  }, []);
}
