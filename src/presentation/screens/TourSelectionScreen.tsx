import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const TourSelectionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách Tour tham quan</Text>
      <Text style={styles.desc}>Màn hình Tour Selection theo thiết kế số 4.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 14, color: '#666' },
});