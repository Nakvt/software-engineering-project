import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageLib {
  /**
   * Lưu một đối tượng bất kỳ vào bộ nhớ máy (dưới dạng JSON string)
   */
  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Lỗi lưu dữ liệu khóa ${key}:`, error);
      return false;
    }
  }

  /**
   * Đọc đối tượng từ bộ nhớ máy và tự động parse về kiểu dữ liệu ban đầu
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (error) {
      console.error(`Lỗi đọc dữ liệu khóa ${key}:`, error);
      return null;
    }
  }

  /**
   * Xóa một mục khỏi bộ nhớ
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Lỗi xóa dữ liệu khóa ${key}:`, error);
      return false;
    }
  }
}