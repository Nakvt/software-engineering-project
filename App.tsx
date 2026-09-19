import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AdminDashboardScreen } from './src/presentation/screens/AdminDashboardScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <AdminDashboardScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
