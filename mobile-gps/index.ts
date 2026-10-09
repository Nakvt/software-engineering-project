import { registerRootComponent } from 'expo';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import App from './App';
import { BACKGROUND_LOCATION_TASK } from './src/libs/location';

// 1. Định nghĩa Task tiếp nhận tọa độ ngầm từ hệ điều hành
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Lỗi nhận dữ liệu Background GPS:', error.message);
    return;
  }
  if (data) {
    // Trích xuất danh sách vị trí hệ điều hành gửi về
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const latestCoord = locations[0].coords;
      console.log(
        ` [GPS Chạy Ngầm] Tọa độ: Lat = ${latestCoord.latitude}, Lng = ${latestCoord.longitude}`
      );
      // Nơi đây sẽ kích hoạt tính khoảng cách và phát âm thanh khi có sự kiện vào bán kính
    }
  }
});

// 2. Đăng ký component gốc của ứng dụng
registerRootComponent(App);