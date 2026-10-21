import { Coordinates } from './Location';

// Bổ sung kiểu cấu trúc hỗ trợ 5 ngôn ngữ
export interface MultiLangString {
  vi: string;
  en?: string;
  ja?: string;
  zh?: string;
  ko?: string;
}

export interface POIAudio {
  audioUrl?: string;
  // ttsScript cho phép dùng kiểu chuỗi đơn thuần HOẶC đối tượng 5 ngôn ngữ
  ttsScript?: string | MultiLangString;
  duration?: number;
}

export interface POI {
  id: string;
  code: string;
  // name cho phép dùng chuỗi đơn thuần HOẶC đối tượng 5 ngôn ngữ
  name: string | MultiLangString;
  description?: string | MultiLangString;
  location: Coordinates;
  radius: number;
  priority: number;
  cooldownSeconds: number;
  imageUrl?: string;
  audio?: POIAudio;
}