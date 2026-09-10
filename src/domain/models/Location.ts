/**
 * Tọa độ địa lý cơ bản (Kinh độ & Vĩ độ)
 */
export interface Coordinates {
  latitude: number;   // Vĩ độ (Ví dụ: 10.762622)
  longitude: number;  // Kinh độ (Ví dụ: 106.660172)
}

/**
 * Vị trí chi tiết lấy từ cảm biến GPS của thiết bị
 */
export interface UserLocation extends Coordinates {
  accuracy: number | null;    // Sai số định vị tính bằng mét
  speed: number | null;       // Tốc độ di chuyển (m/s)
  timestamp: number;          // Thời điểm ghi nhận tọa độ
}