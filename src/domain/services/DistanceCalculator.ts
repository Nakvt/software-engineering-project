import { Coordinates } from '../models/Location';

export class DistanceCalculator {
  // Bán kính trung bình của Trái Đất (tính bằng mét)
  private static readonly EARTH_RADIUS_METERS = 6371000;

  /**
   * Chuyển đổi độ (degrees) sang radian
   */
  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Tính khoảng cách chính xác giữa 2 điểm tọa độ theo công thức Haversine
   * @param coord1 Tọa độ điểm thứ nhất (ví dụ: vị trí người dùng)
   * @param coord2 Tọa độ điểm thứ hai (ví dụ: tọa độ POI)
   * @returns Khoảng cách theo đơn vị mét (meters)
   */
  public static calculateDistanceInMeters(
    coord1: Coordinates,
    coord2: Coordinates
  ): number {
    const lat1Rad = this.toRadians(coord1.latitude);
    const lat2Rad = this.toRadians(coord2.latitude);
    const deltaLatRad = this.toRadians(coord2.latitude - coord1.latitude);
    const deltaLonRad = this.toRadians(coord2.longitude - coord1.longitude);

    // Công thức Haversine
    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLonRad / 2) *
        Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_METERS * c;
  }
}