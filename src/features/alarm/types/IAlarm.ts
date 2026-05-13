export interface IAlarm {
  id: number;
  name: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  isFavorite: boolean;
  address: string | null;
}
