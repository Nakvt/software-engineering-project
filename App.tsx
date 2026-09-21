import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { MapScreen } from './src/presentation/screens/MapScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MapScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});