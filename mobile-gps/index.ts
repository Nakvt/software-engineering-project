import { registerRootComponent } from 'expo';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import App from './App';
import { BACKGROUND_LOCATION_TASK } from './src/libs/location';
import { poiService } from './src/domain/services/poiService';
import { GeofenceService } from './src/domain/services/GeofenceService';

// Định nghĩa Task tiếp nhận tọa độ GPS chạy ngầm từ hệ điều hành
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Lỗi nhận dữ liệu Background GPS:', error.message);
    return;
  }
 
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations || locations.length === 0) return;

    const latest = locations[0].coords;
    const currentCoords = { lat: latest.latitude, lng: latest.longitude };
    console.log(`📡 [GPS Chạy Ngầm] Lat: ${currentCoords.lat}, Lng: ${currentCoords.lng}`);

    try {
      // 1. Lấy danh sách POIs (từ Backend API hoặc fallback Mock)
      const pois = await poiService.getAllPOIs();

      // 2. Sử dụng hàm evaluateGeofence chuẩn của GeofenceService
      const result = GeofenceService.evaluateGeofence(currentCoords, pois);

      // 3. Nếu đủ điều kiện kích hoạt -> Ghi nhận log vùng di tích
      if (result.shouldTrigger && result.poi) {
        console.log(`🔔 [Background Trigger] Đã vào vùng di tích: ${result.poi.name} (Khoảng cách: ${result.distanceMeters?.toFixed(1)}m)`);
      }
    } catch (err) {
      console.error('Lỗi xử lý logic chạy ngầm:', err);
    }
  }
});

// Đăng ký component App gốc
registerRootComponent(App);