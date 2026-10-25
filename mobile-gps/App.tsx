import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { useOnlineSession } from './src/presentation/hooks/useOnlineSession';

/**
 * Component chính của ứng dụng Mobile GPS
 */
export default function App() {
  // Kích hoạt cơ chế tự động tạo phiên (Session) và gửi Heartbeat định kỳ 60s lên Backend
  useOnlineSession();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}