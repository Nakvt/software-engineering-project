import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { poiService } from '../../domain/services/poiService';

type Props = NativeStackScreenProps<RootStackParamList, 'QRScanner'>;

export const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);

  // 1. Kiểm tra trạng thái cấp quyền Camera
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Cần cấp quyền camera để quét mã QR hiện vật</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Cấp quyền Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Hàm xử lý sự kiện khi camera đọc được mã QR
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // Ngay lập tức khóa quét để tránh camera quét trùng lặp nhiều lần
    setScanned(true);

    try {
      // Tìm kiếm POI qua Service (Backend API hoặc Mock Fallback)
      const matchedPOI = await poiService.getPOIById(data);

      if (matchedPOI) {
        // Tìm thấy POI -> Điều hướng sang màn hình nghe audio
        navigation.navigate('AudioPlayer', { poi: matchedPOI });
      } else {
        // Quét trúng mã không hợp lệ (mã vạch sản phẩm, QR Momo,...)
        Alert.alert(
          'Mã QR không hợp lệ',
          `Không tìm thấy di tích tương ứng với mã: ${data}`,
          [{ text: 'Quét lại', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('Lỗi khi tra cứu mã QR:', error);
      Alert.alert('Lỗi hệ thống', 'Không thể tra cứu thông tin di tích.', [
        { text: 'Thử lại', onPress: () => setScanned(false) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.scanTarget} />
        <Text style={styles.hint}>Hướng camera vào mã QR hiện vật để nghe thuyết minh</Text>
        {scanned && (
          <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>Quét lại</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { color: '#fff', fontSize: 16, marginBottom: 15, textAlign: 'center' },
  btn: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanTarget: { width: 250, height: 250, borderWidth: 2, borderColor: '#00FF00', borderRadius: 12, backgroundColor: 'transparent' },
  hint: { color: '#fff', marginTop: 20, fontSize: 14, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 6 },
  rescanBtn: { marginTop: 20, backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  rescanText: { color: '#000', fontWeight: 'bold' },
});