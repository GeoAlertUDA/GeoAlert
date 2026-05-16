import { create } from 'zustand';
import { GlobalSoundSettings } from '../types/settingsTypes';
import { DEFAULT_SOUND_ID } from '../constants/sound';

type GlobalSettingsStore = {
  settings: GlobalSoundSettings;
  setSettings: (patch: Partial<GlobalSoundSettings>) => void;
};

const DEFAULT_SETTINGS: GlobalSoundSettings = {
  selectedSoundId: DEFAULT_SOUND_ID,
  vibrationEnabled: true,
  progressiveVolume: false,
  energySaving: false,
  dataSaving: false,
};

export const useGlobalSettingsStore = create<GlobalSettingsStore>((set) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (patch) =>
    set((state) => ({ settings: { ...state.settings, ...patch } })),
}));