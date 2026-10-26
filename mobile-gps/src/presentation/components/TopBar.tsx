import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SupportedLanguage } from '../hooks/useGeofencing';

interface TopBarProps {
  currentLanguage?: SupportedLanguage;
  onSelectLanguage?: (lang: SupportedLanguage) => void;
  onPressScanQR?: () => void;
  onSearchChange?: (text: string) => void;
}

// Danh sách 5 ngôn ngữ hỗ trợ cùng biểu tượng lá cờ
const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export const TopBar: React.FC<TopBarProps> = ({
  currentLanguage = 'vi',
  onSelectLanguage,
  onPressScanQR,
  onSearchChange,
}) => {
  // State quản lý ẩn/hiện Modal danh sách ngôn ngữ
  const [modalVisible, setModalVisible] = useState(false);

  // Trích xuất lá cờ và mã hiển thị theo ngôn ngữ được chọn
  const activeLangConfig =
    LANGUAGES.find((item) => item.code === currentLanguage) || LANGUAGES[0];

  return (
    <View style={styles.safeContainer}>
      <View style={styles.topRow}>
        {/* 1. Bộ chọn ngôn ngữ góc trên bên trái (Bấm mở Modal) */}
        <TouchableOpacity
          style={styles.langSelector}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.flag}>{activeLangConfig.flag}</Text>
          <Text style={styles.langText}>{activeLangConfig.code.toUpperCase()}</Text>
          <Ionicons name="caret-down" size={12} color="#1c1c1e" />
        </TouchableOpacity>

        {/* 2. Nút quét QR xanh dương */}
        <TouchableOpacity style={styles.qrButton} onPress={onPressScanQR}>
          <Ionicons name="scan-outline" size={20} color="#ffffff" />
          <Text style={styles.qrText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Thanh Search POI */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#8e8e93" style={styles.searchIcon} />
        <TextInput
          placeholder="Search POI..."
          placeholderTextColor="#8e8e93"
          style={styles.searchInput}
          onChangeText={onSearchChange}
        />
      </View>

      {/* 4. Modal hiển thị Menu danh sách ngôn ngữ khi nhấp chuột vào nút góc trái */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <Text style={styles.menuTitle}>Chọn ngôn ngữ thuyết minh</Text>
                <FlatList
                  data={LANGUAGES}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.menuItem,
                        currentLanguage === item.code && styles.menuItemActive,
                      ]}
                      onPress={() => {
                        if (onSelectLanguage) {
                          onSelectLanguage(item.code);
                        }
                        setModalVisible(false);
                      }}
                    >
                      <Text style={styles.menuItemText}>
                        {item.flag} {item.label}
                      </Text>
                      {currentLanguage === item.code && (
                        <Ionicons name="checkmark-sharp" size={18} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flag: {
    fontSize: 16,
    marginRight: 4,
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c1c1e',
    marginRight: 4,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  qrText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1c1c1e',
  },
  // Style cho Modal danh sách ngôn ngữ
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 12,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemActive: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 15,
    color: '#1c1c1e',
    fontWeight: '500',
  },
});