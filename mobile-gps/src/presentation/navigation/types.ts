import { NavigatorScreenParams } from '@react-navigation/native';
import { POI } from '../../domain/models/POI';

/**
 * Định nghĩa các tham số truyền giữa các màn hình Stack chính
 */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AudioPlayer: { poi: POI; distanceMeters?: number };
  QRScanner: undefined;
};

/**
 * Định nghĩa danh sách các tab ở thanh Bottom Tab Bar
 */
export type MainTabParamList = {
  Map: undefined;
  Tours: undefined;
  Profile: undefined;
};