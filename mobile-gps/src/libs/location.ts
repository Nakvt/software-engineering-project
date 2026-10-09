import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Coordinates } from '../domain/models/Location';

// Chuỗi định danh duy nhất cho tác vụ chạy ngầm
export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_AUDIO_GUIDE_LOCATION_TASK';

export class LocationLib {
  /**
   * Xin quyền GPS: Cả Foreground (mở app) lẫn Background (chạy ngầm)
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      // 1. Xin quyền khi đang mở ứng dụng
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.warn('Quyền GPS mở app (Foreground) bị từ chối.');
        return false;
      }

      // 2. Xin quyền khi chạy nền
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Quyền GPS chạy ngầm (Background) bị từ chối. Chỉ phát khi mở màn hình.');
        return true; // Vẫn trả về true để cho phép dùng ở chế độ mở màn hình
      }

      return true;
    } catch (error) {
      console.error('Lỗi khi yêu cầu cấp quyền GPS:', error);
      return false;
    }
  }

  /**
   * Bắt đầu kích hoạt tiến trình theo dõi vị trí ngầm
   */
  static async startBackgroundTracking(): Promise<void> {
    try {
      // Kiểm tra xem task đã được hệ điều hành kích hoạt chưa
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        console.log('Background Task đã được đăng ký từ trước.');
        return;
      }

      // Đăng ký dịch vụ cập nhật vị trí ngầm
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,    // Quét mỗi 3 giây
        distanceInterval: 3,   // Chỉ gửi tọa độ khi di chuyển tối thiểu 3 mét (tiết kiệm pin)
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Audio Guide đang hoạt động',
          notificationBody: 'Đang theo dõi vị trí để thuyết minh di tích tự động.',
          notificationColor: '#007AFF',
        },
      });
      console.log(' Đã kích hoạt Background Location Tracking thành công');
    } catch (error) {
      console.error('Lỗi khi kích hoạt Background Location:', error);
    }
  }

  /**
   * Hủy theo dõi vị trí ngầm khi tắt tour
   */
  static async stopBackgroundTracking(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log(' Đã dừng Background Location Tracking');
      }
    } catch (error) {
      console.error('Lỗi khi dừng Background Location:', error);
    }
  }

  /**
   * Lấy vị trí tức thời 1 lần duy nhất
   */
  static async getCurrentLocation(): Promise<Coordinates | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
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
}