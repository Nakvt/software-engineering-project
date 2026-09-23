import { Coordinates } from './Location';

export interface POIAudio {
  audioUrl?: string;
  ttsScript?: string;
  duration?: number;
}

export interface POI {
  id: string;
  code: string;
  name: string;
  location: Coordinates;
  radius: number;
  priority: number;
  cooldownSeconds: number;
  imageUrl: string;
  audio?: POIAudio;
}