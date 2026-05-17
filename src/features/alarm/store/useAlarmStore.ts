import { create } from "zustand";
import { IAlarm } from "../types/IAlarm";
import { getDBConnection } from "@/localDB/db";
import {
  getAllAlarms,
  insertAlarm,
  setAlarmActive,
  updateAlarm,
  deleteAlarm,
  setAlarmRinging,
  toggleAlarmActive,
  toggleAlarmFavorite,
} from "@/localDB/alarm/alarm";
import { stopAlarmAlert } from "@/features/options/service/soundService";
import { syncAlarmGeofences } from "../service/alarmGeofencingService";
import {
  countActiveAlarms,
  MAX_ACTIVE_ALARMS,
  MAX_ACTIVE_ALARMS_LIMIT_ERROR,
} from "../constants/maxActiveAlarms";

interface AlarmState {
  alarms: IAlarm[];
  isLoading: boolean;
  error: string | null;

  loadAlarms: () => Promise<void>;
  addAlarm: (alarm: Omit<IAlarm, "id">) => Promise<IAlarm>;
  editAlarm: (alarm: IAlarm) => Promise<void>;
  cancelAlarm: (id: number) => Promise<void>;
  removeAlarm: (id: number) => Promise<void>;
  toggleActive: (id: number, currentValue: boolean) => Promise<void>;
  toggleFavorite: (id: number, currentValue: boolean) => Promise<void>;
  stopRinging: (id: number) => Promise<void>;
  clearError: () => void;
}

async function syncGeofencesSafely(requestPermissions = false) {
  try {
    await syncAlarmGeofences({ requestPermissions });
  } catch (e) {
    console.error("[AlarmStore] syncAlarmGeofences:", e);
  }
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
  isLoading: false,
  error: null,

  loadAlarms: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDBConnection();
      const alarms = await getAllAlarms(db);
      set({ alarms, isLoading: false });
      await syncGeofencesSafely(false);
    } catch (e) {
      set({ error: "Failed to load alarms.", isLoading: false });
      console.error("[AlarmStore] loadAlarms:", e);
    }
  },

  addAlarm: async (alarm) => {
    set({ isLoading: true, error: null });
    try {
      if (alarm.isActive) {
        const activeCount = countActiveAlarms(get().alarms);
        if (activeCount >= MAX_ACTIVE_ALARMS) {
          set({ isLoading: false });
          throw new Error(MAX_ACTIVE_ALARMS_LIMIT_ERROR);
        }
      }

      const db = await getDBConnection();
      const id = await insertAlarm(db, alarm);
      const newAlarm: IAlarm = { ...alarm, id };
      set((state) => ({
        alarms: [...state.alarms, newAlarm],
        isLoading: false,
      }));
      await syncGeofencesSafely(alarm.isActive);
      return newAlarm;
    } catch (e) {
      set({ error: "Failed to add alarm.", isLoading: false });
      console.error("[AlarmStore] addAlarm:", e);
      throw e;
    }
  },

  editAlarm: async (alarm) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDBConnection();
      await updateAlarm(db, alarm);
      set((state) => ({
        alarms: state.alarms.map((a) => (a.id === alarm.id ? alarm : a)),
        isLoading: false,
      }));
      await syncGeofencesSafely(alarm.isActive);
    } catch (e) {
      set({ error: "Failed to update alarm.", isLoading: false });
      console.error("[AlarmStore] editAlarm:", e);
    }
  },

  cancelAlarm: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await stopAlarmAlert();

      const db = await getDBConnection();
      await setAlarmRinging(db, id, false);
      await setAlarmActive(db, id, false);

      set((state) => ({
        alarms: state.alarms.map((alarm) =>
          alarm.id === id
            ? { ...alarm, isActive: false, isRinging: false }
            : alarm,
        ),
        isLoading: false,
      }));

      await syncGeofencesSafely(false);
    } catch (e) {
      set({ error: "Failed to cancel alarm.", isLoading: false });
      console.error("[AlarmStore] cancelAlarm:", e);
    }
  },

  removeAlarm: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const alarm = get().alarms.find((item) => item.id === id);
      if (alarm?.isRinging) {
        await stopAlarmAlert();
      }

      const db = await getDBConnection();
      await deleteAlarm(db, id);
      set((state) => ({
        alarms: state.alarms.filter((a) => a.id !== id),
        isLoading: false,
      }));
      await syncGeofencesSafely(false);
    } catch (e) {
      set({ error: "Failed to delete alarm.", isLoading: false });
      console.error("[AlarmStore] removeAlarm:", e);
    }
  },

  toggleActive: async (id, currentValue) => {
    try {
      if (!currentValue) {
        const activeCount = countActiveAlarms(get().alarms);
        if (activeCount >= MAX_ACTIVE_ALARMS) {
          return;
        }
      }

      const db = await getDBConnection();
      await toggleAlarmActive(db, id, currentValue);
      set((state) => ({
        alarms: state.alarms.map((a) =>
          a.id === id ? { ...a, isActive: !currentValue } : a,
        ),
      }));
      await syncGeofencesSafely(!currentValue);
    } catch (e) {
      set({ error: "Failed to toggle alarm." });
      console.error("[AlarmStore] toggleActive:", e);
    }
  },

  toggleFavorite: async (id, currentValue) => {
    try {
      const db = await getDBConnection();
      await toggleAlarmFavorite(db, id, currentValue);
      set((state) => ({
        alarms: state.alarms.map((a) =>
          a.id === id ? { ...a, isFavorite: !currentValue } : a,
        ),
      }));
    } catch (e) {
      set({ error: "Failed to toggle favorite." });
      console.error("[AlarmStore] toggleFavorite:", e);
    }
  },

  stopRinging: async (id) => {
    try {
      await stopAlarmAlert();

      const db = await getDBConnection();
      await setAlarmRinging(db, id, false);

      set((state) => ({
        alarms: state.alarms.map((alarm) =>
          alarm.id === id ? { ...alarm, isRinging: false } : alarm,
        ),
      }));
    } catch (e) {
      set({ error: "Failed to stop alarm." });
      console.error("[AlarmStore] stopRinging:", e);
    }
  },

  clearError: () => set({ error: null }),
}));
