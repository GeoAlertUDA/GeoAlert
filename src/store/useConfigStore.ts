import { create } from 'zustand';
import { IConfig } from '../types/IConfig';
import { getDBConnection } from '../localDB/db';
import {getConfig,saveConfig,updateConfigField} from '../localDB/config/config';

const DEFAULT_CONFIG: Omit<IConfig, 'id'> = {
  vibrate:false,
  progressiveVolume:false,
  batterySave:false,
  mobileInternet:true,
};

interface ConfigState {
  config:    IConfig | null;
  isLoading: boolean;
  error:     string | null;

  loadConfig:() => Promise<void>;
  saveConfig:(config: Omit<IConfig, 'id'>) => Promise<void>;
  updateField:(field: keyof Omit<IConfig, 'id'>, value: boolean) => Promise<void>;
  clearError:() => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config:null,
  isLoading:false,
  error:null,

  loadConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const db     = await getDBConnection();
      let   config = await getConfig(db);

      if (!config) {
        await saveConfig(db, DEFAULT_CONFIG);
        config = { id: 1, ...DEFAULT_CONFIG };
      }

      set({ config, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load configuration.', isLoading: false });
      console.error('[ConfigStore] loadConfig:', e);
    }
  },

  saveConfig: async (config) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDBConnection();
      await saveConfig(db, config);
      set({ config: { id: 1, ...config }, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to save configuration.', isLoading: false });
      console.error('[ConfigStore] saveConfig:', e);
    }
  },

  updateField: async (field, value) => {
    try {
      const db = await getDBConnection();
      await updateConfigField(db, field, value);
      set((state) =>
        state.config
          ? { config: { ...state.config, [field]: value } }
          : {},
      );
    } catch (e) {
      set({ error: 'Failed to update setting.' });
      console.error('[ConfigStore] updateField:', e);
    }
  },

  clearError: () => set({ error: null }),
}));
