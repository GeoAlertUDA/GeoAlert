import { SoundOption } from "../types/settingsTypes";
 
/**
 * Para agregar un tono:
 * 1. Copiar el .mp3 a src/assets/sounds/
 * 2. Agregar una entrada acá
 */
export const AVAILABLE_SOUNDS: SoundOption[] = [
  {
    id: 'default',
    label: 'Por defecto',
    file: require('src/features/options/assets/sound1.mp3'),
  },
  {
    id: 'chime',
    label: 'Campana',
    file: require('src/features/options/assets/sound1.mp3'),
  },
  {
    id: 'bell',
    label: 'Timbre',
    file: require('src/features/options/assets/sound1.mp3'),
  },
  {
    id: 'digital',
    label: 'Digital',
    file: require('src/features/options/assets/sound1.mp3'),
  },
  {
    id: 'soft',
    label: 'Suave',
    file: require('src/features/options/assets/sound1.mp3'),
  },
];
 
export const DEFAULT_SOUND_ID = 'default';
