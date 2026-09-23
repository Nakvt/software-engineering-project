export interface Tour {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  durationMinutes: number;
  distanceKm: number;
  poiIds: string[];
}