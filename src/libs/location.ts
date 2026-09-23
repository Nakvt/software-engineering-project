import * as Location from 'expo-location';
import { Coordinates } from '../domain/models/Location';

export class LocationLib {
  /**
   * Xin quyền truy cập GPS từ người dùng (cả khi mở app lẫn khi chạy nền)
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      return foregroundStatus === 'granted';
    } catch (error) {
      console.error('Lỗi khi xin quyền GPS:', error);
      return false;
    }
  }

  /**
   * Lấy tọa độ hiện tại 1 lần duy nhất
   */
  static async getCurrentPosition(): Promise<Coordinates | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (error) {
      console.error('Lỗi khi lấy vị trí hiện tại:', error);
      return null;
    }
  }

  /**
   * Lắng nghe tọa độ liên tục theo thời gian thực
   * @param callback Hàm nhận tọa độ mới mỗi khi người dùng di chuyển
   */
  static async watchPosition(
    callback: (coords: Coordinates) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,   // Cập nhật sau mỗi 3 giây
          distanceInterval: 5,  // Hoặc khi di chuyển từ 5 mét trở lên
        },
        (location) => {
          callback({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error('Lỗi khi theo dõi vị trí:', error);
      return null;
    }
  }
}