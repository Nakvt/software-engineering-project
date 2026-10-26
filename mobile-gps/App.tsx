import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { useSessionHeartbeat } from './src/presentation/hooks/useSessionHeartbeat';

export default function App() {
  useSessionHeartbeat();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
