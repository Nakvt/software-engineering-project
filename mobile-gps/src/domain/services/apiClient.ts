import axios from 'axios';

/**
 * CẤU HÌNH ĐỊA CHỈ IP BACKEND:
 * - Khi test trên máy thật qua Expo Go, KHÔNG ĐƯỢC dùng 'localhost' hoặc '127.0.0.1' 
 *   vì điện thoại sẽ trỏ về chính nó.
 * - Hãy dùng địa chỉ IPv4 nội bộ máy tính của bạn (VD: 'http://192.168.1.X:3000') 
 *   hoặc đường link tunnel (ngrok).
 */
export const BASE_API_URL = 'http://192.168.1.100:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 5000, // Quá 5 giây không phản hồi thì tự ngắt để chuyển sang fallback
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});