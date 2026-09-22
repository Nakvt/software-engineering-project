import { Coordinates } from './Location';

export type Accent = 'north' | 'central' | 'south';

export interface POIAudio {
  languageCode: string;
  accent: Accent;
  audioUrl?: string;
  ttsScript?: string;
  duration?: number;
}

export interface POI {
  id: string;
  code: string;
  name: string;
  description: string;
  location: Coordinates;
  radius: number;
  priority: number;
  cooldownSeconds: number;
  imageUrl?: string;
  audio?: POIAudio;
}