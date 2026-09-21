import { Coordinates } from './Location';

export type LanguageCode = string;
export type Accent = 'north' | 'central' | 'south'; // Chuẩn API: 'accent'


export interface POIAudio {
  audioUrl?: string;       // Link file mp3 (nếu có)
  ttsScript: string;       // Script đọc bằng TTS
  duration?: number;       // Thời lượng tính bằng giây
}


export interface POI {
  id: string;
  code: string;            // Mã định danh (dùng luôn cho quét QR Code)
  name: string;            // Tên điểm thuyết minh
  location: Coordinates;   // Tọa độ { lat, lng }
  radius: number;          // Bán kính kích hoạt (mét)
  priority: number;        // Độ ưu tiên
  cooldownSeconds: number; // Thời gian chờ chống spam từ backend
  imageUrl?: string;
  audio?: POIAudio;        // Nội dung audio/script theo ngôn ngữ/accent được request
}