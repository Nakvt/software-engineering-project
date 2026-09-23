import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TopBarProps {
  currentLanguage?: string;
  onPressLanguage?: () => void;
  onPressScanQR?: () => void;
  onSearchChange?: (text: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentLanguage = 'VI',
  onPressLanguage,
  onPressScanQR,
  onSearchChange,
}) => {
  return (
    <View style={styles.safeContainer}>
      <View style={styles.topRow}>
        {/* Bộ chọn ngôn ngữ */}
        <TouchableOpacity style={styles.langSelector} onPress={onPressLanguage}>
          <Text style={styles.flag}>🇻🇳</Text>
          <Text style={styles.langText}>{currentLanguage}</Text>
          <Ionicons name="caret-down" size={12} color="#1c1c1e" />
        </TouchableOpacity>

        {/* Nút quét QR xanh dương */}
        <TouchableOpacity style={styles.qrButton} onPress={onPressScanQR}>
          <Ionicons name="scan-outline" size={20} color="#ffffff" />
          <Text style={styles.qrText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* Thanh Search POI */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#8e8e93" style={styles.searchIcon} />
        <TextInput
          placeholder="Search POI..."
          placeholderTextColor="#8e8e93"
          style={styles.searchInput}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
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
});