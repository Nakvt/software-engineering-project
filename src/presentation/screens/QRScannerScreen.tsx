import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { MOCK_POIS } from '../../domain/models/mockPOI';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'QRScanner'>;

export const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);

  // Xin quyền camera khi vào màn hình nếu chưa có
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Xử lý khi quét được mã barcode / QR
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Tra cứu nội bộ theo đúng trường code trong POI contract
    const matchedPOI = MOCK_POIS.find(
      (poi) => poi.code === data || poi.id === data
    );

    if (matchedPOI) {
      navigation.replace('AudioPlayer', { poi: matchedPOI });
    } else {
      Alert.alert(
        'Không tìm thấy địa điểm',
        `Mã QR "${data}" không khớp với hệ thống.`,
        [{ text: 'Quét lại', onPress: () => setScanned(false) }]
      );
    }
  };
  
  if (!permission) {
    return <View style={styles.centerContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>
          Ứng dụng cần quyền sử dụng máy ảnh để quét mã QR tại các di tích.
        </Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Cấp quyền Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Camera View quét mã vạch */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* 2. Lớp phủ giao diện quét (Overlay Frame) */}
      <View style={styles.overlay}>
        {/* Nút thoát ở góc trên */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.guideText}>Hướng camera về phía mã QR tại hiện vật</Text>

        {/* Khung ngắm quét mã */}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <Text style={styles.subText}>Hệ thống sẽ tự động phát thuyết minh</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 24,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  grantButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  grantButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#8e8e93',
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  guideText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  scanFrame: {
    width: 240,
    height: 240,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#007AFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  subText: {
    color: '#d1d1d6',
    fontSize: 13,
    marginTop: 24,
  },
});