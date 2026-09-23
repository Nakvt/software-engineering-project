import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'QRScanner'>;

export const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trình quét QR Code</Text>
      <Text style={styles.desc}>Màn hình QR Scanner theo thiết kế số 3.</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  desc: { fontSize: 14, color: '#aaa', marginBottom: 24 },
  backBtn: { backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  backText: { color: '#fff', fontWeight: 'bold' },
});