import { SoundOption } from "../types/settingsTypes";

/**
 * Para agregar un tono:
 * 1. Copiar el .mp3 a src/features/options/assets/
 * 2. Agregar una entrada en AVAILABLE_SOUNDS
 */
export const AVAILABLE_SOUNDS: SoundOption[] = [
  {
    id: "default",
    label: "Por defecto",
    file: require("../assets/sound1.mp3"),
  },
  {
    id: "chime",
    label: "Campana",
    file: require("../assets/campana.mp3"),
  },
  {
    id: "bell",
    label: "Timbre",
    file: require("../assets/timbre.mp3"),
  },
  {
    id: "digital",
    label: "Digital",
    file: require("../assets/digital.mp3"),
  },
  {
    id: "soft",
    label: "Suave",
    file: require("../assets/suave.mp3"),
  },
  {
    id: "extremo",
    label: "Extremo",
    file: require("../assets/extremo.mp3"),
  },
  {
    id: "radar",
    label: "Radar",
    file: require("../assets/radar.mp3"),
  },
];

export const DEFAULT_SOUND_ID = "default";

export function normalizeSoundId(id: string | undefined | null): string {
  if (!id) return DEFAULT_SOUND_ID;
  if (AVAILABLE_SOUNDS.some((s) => s.id === id)) return id;
  return DEFAULT_SOUND_ID;
}
