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
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  isRinging: boolean;
  address: string | null;
}
