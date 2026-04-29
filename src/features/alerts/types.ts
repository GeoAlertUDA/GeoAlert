export interface IAlarm {
  name?: string;
  location: ILocation;
  distance: number;
  sound: boolean;
  vibration: boolean;
  activeNow: boolean;
  favorite: boolean;
  lastUsed: Date;
}

//despues borrar y hacer interface real
interface ILocation {
  street: string;
  number: number;
}
