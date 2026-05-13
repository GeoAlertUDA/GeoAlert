import { create } from "zustand";
import { IAlarm } from "../types/IAlarm";
import { getDBConnection } from "@/localDB/db";
import {
  getAllAlarms,
  insertAlarm,
  updateAlarm,
  deleteAlarm,
  toggleAlarmActive,
  toggleAlarmFavorite,
} from "@/localDB/alarm/alarm";

interface AlarmState {
  alarms: IAlarm[];
  isLoading: boolean;
  error: string | null;
  alarms: IAlarm[];
  isLoading: boolean;
  error: string | null;

  loadAlarms: () => Promise<void>;
  addAlarm: (alarm: Omit<IAlarm, "id">) => Promise<void>;
  editAlarm: (alarm: IAlarm) => Promise<void>;
  removeAlarm: (id: number) => Promise<void>;
  toggleActive: (id: number, currentValue: boolean) => Promise<void>;
  toggleFavorite: (id: number, currentValue: boolean) => Promise<void>;
  clearError: () => void;
}

export const useAlarmStore = create<AlarmState>((set) => ({
  alarms: [],
  isLoading: false,
  error: null,
  alarms: [],
  isLoading: false,
  error: null,

  loadAlarms: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDBConnection();
      const alarms = await getAllAlarms(db);
      set({ alarms, isLoading: false });
    } catch (e) {
      set({ error: "Failed to load alarms.", isLoading: false });
      console.error("[AlarmStore] loadAlarms:", e);
    }
  },

  addAlarm: async (alarm) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDBConnection();
      const id = await insertAlarm(db, alarm);
      const newAlarm: IAlarm = { ...alarm, id };
      set((state) => ({
        alarms: [...state.alarms, newAlarm],
        isLoading: false,
      }));
    } catch (e) {
      set({ error: "Failed to add alarm.", isLoading: false });
      console.error("[AlarmStore] addAlarm:", e);
    }
  },

  editAlarm: async (alarm) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDBConnection();
      await updateAlarm(db, alarm);
      set((state) => ({
        alarms: state.alarms.map((a) => (a.id === alarm.id ? alarm : a)),
        alarms: state.alarms.map((a) => (a.id === alarm.id ? alarm : a)),
        isLoading: false,
      }));
    } catch (e) {
      set({ error: "Failed to update alarm.", isLoading: false });
      console.error("[AlarmStore] editAlarm:", e);
    }
  },

  removeAlarm: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const db = await getDBConnection();
      await deleteAlarm(db, id);
      set((state) => ({
        alarms: state.alarms.filter((a) => a.id !== id),
        alarms: state.alarms.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (e) {
      set({ error: "Failed to delete alarm.", isLoading: false });
      console.error("[AlarmStore] removeAlarm:", e);
    }
  },

  toggleActive: async (id, currentValue) => {
    const willBeActive = !currentValue;
    try {
      const db = await getDBConnection();
      await toggleAlarmActive(db, id, currentValue);

      set((state) => ({
        alarms: state.alarms.map((a) => {
          if (a.id === id) {
            return { ...a, isActive: willBeActive };
          }
          if (willBeActive) {
            return { ...a, isActive: false }; // Apagamos las demás
          }
          return a;
        }),
      }));
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

  clearError: () => set({ error: null }),
}));
