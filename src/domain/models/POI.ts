import { Coordinates } from './Location';

/**
 * Mã ngôn ngữ chuẩn quốc tế ISO 639-1 / BCP-47 (ví dụ: 'vi', 'en', 'fr', 'es', 'de', 'ja', 'ko',...)
 * Dùng string linh hoạt thay vì union type cố định để hỗ trợ bất kỳ ngôn ngữ nào.
 */
export type LanguageCode = string;

export type Dialect = 'north' | 'central' | 'south';

/**
 * Nội dung thuyết minh tương ứng với từng ngôn ngữ
 */
export interface AudioContent {
  id: string;
  language: LanguageCode;  // Bất kỳ ngôn ngữ nào người dùng chọn
  dialect?: Dialect;
  audioUrl?: string;       // File âm thanh thu sẵn (nếu có)
  scriptText: string;      // BẮT BUỘC: Văn bản thuyết minh để máy có thể đọc (TTS) bất cứ lúc nào
}

export interface POI {
  id: string;
  title: string;
  description: string;
  coordinate: Coordinates;
  radius: number;          // Mét
  priority: number;
  audios: AudioContent[];  // Chứa danh sách nội dung theo các thứ tiếng
  qrCodeValue?: string;
  imageUrl?: string;
}