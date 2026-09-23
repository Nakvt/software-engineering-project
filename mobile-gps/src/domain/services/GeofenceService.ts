import { Coordinates } from '../models/Location';
import { POI } from '../models/POI';
import { DistanceCalculator } from './DistanceCalculator';

export interface GeofenceTriggerResult {
  shouldTrigger: boolean;
  poi?: POI;
  distanceMeters?: number;
}

export class GeofenceService {
  // Bộ nhớ đệm lưu thời điểm phát gần nhất của từng POI (Key: POI id, Value: Timestamp ms)
  // Đóng vai trò là bộ lọc Cooldown chống spam
  private static lastTriggeredTimestamps: Map<string, number> = new Map();

  /**
   * Kiểm tra vị trí hiện tại của người dùng với danh sách các POI
   * @param userLocation Tọa độ hiện tại của người dùng
   * @param pois Danh sách tất cả các điểm POI trên tour
   * @returns Kết quả điểm POI cần được kích hoạt thuyết minh
   */
  public static evaluateGeofence(
    userLocation: Coordinates,
    pois: POI[]
  ): GeofenceTriggerResult {
    const now = Date.now();
    const candidatePois: { poi: POI; distance: number }[] = [];

    // 1. Quét tìm tất cả các POI mà người dùng đang nằm trong bán kính kích hoạt
    for (const poi of pois) {
      const distance = DistanceCalculator.calculateDistanceInMeters(
        userLocation,
        poi.location
      );

      if (distance <= poi.radius) {
        // Kiểm tra xem POI này có đang trong thời gian hồi chiêu (Cooldown) không
        const lastTriggered = this.lastTriggeredTimestamps.get(poi.id) || 0;
        const cooldownMs = poi.cooldownSeconds * 1000;

        if (now - lastTriggered >= cooldownMs) {
          candidatePois.push({ poi, distance });
        }
      }
    }

    // 2. Nếu không có điểm nào thỏa mãn
    if (candidatePois.length === 0) {
      return { shouldTrigger: false };
    }

    // 3. Nếu có nhiều điểm thỏa mãn cùng lúc: Sắp xếp theo Priority cao nhất
    // Nếu Priority bằng nhau thì ưu tiên điểm ở gần người dùng hơn
    candidatePois.sort((a, b) => {
      if (b.poi.priority !== a.poi.priority) {
        return b.poi.priority - a.poi.priority;
      }
      return a.distance - b.distance;
    });

    const selected = candidatePois[0];

    // Ghi nhận thời điểm kích hoạt để tính thời gian Cooldown cho lần sau
    this.lastTriggeredTimestamps.set(selected.poi.id, now);

    return {
      shouldTrigger: true,
      poi: selected.poi,
      distanceMeters: selected.distance,
    };
  }

  /**
   * Reset bộ đệm Cooldown (hữu ích khi người dùng bắt đầu lại tour mới)
   */
  public static resetCooldowns(): void {
    this.lastTriggeredTimestamps.clear();
  }
}