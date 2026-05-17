export type SoundOption = {
  id: string;
  label: string;
  file: any; // require('...')
};
 
export type VibrationPattern = 'short' | 'long' | 'double';
 
/** Configuración global guardada en el store */
export type GlobalSoundSettings = {
  selectedSoundId: string;   // id del tono elegido
  vibrationEnabled: boolean;
  progressiveVolume: boolean;
  energySaving: boolean;
  dataSaving: boolean;
  reduceBatteryOptimizationBlocks: boolean;
  reduceUnexpectedBackgroundStops: boolean;
};
 
/**
 * Override de sonido para una alarma específica.
 * Si useGlobal = true → se usa GlobalSoundSettings al disparar.
 */
export type AlarmSoundOverride = {
  useGlobal: boolean;
  selectedSoundId: string;
  vibrationEnabled: boolean;
  progressiveVolume: boolean;
};
 
