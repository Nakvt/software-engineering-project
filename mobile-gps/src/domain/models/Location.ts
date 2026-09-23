/**
 * Tọa độ địa lý khớp chuẩn API Backend (lat/lng)
 */
export interface Coordinates {
  lat: number;   // Vĩ độ (Latitude)
  lng: number;   // Kinh độ (Longitude)
}

/**
 * Thông tin vị trí chi tiết từ cảm biến GPS
 */
export interface UserLocation extends Coordinates {
  accuracy: number | null;    // Sai số định vị (mét)
  speed: number | null;       // Tốc độ di chuyển (m/s)
  timestamp: number;          // Thời điểm ghi nhận
}