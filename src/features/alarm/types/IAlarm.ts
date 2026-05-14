export interface IAlarm {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  sound: boolean | null;
  vibration: boolean | null;
  isActive: boolean;
  isFavorite: boolean;
  address: string | null;
}
