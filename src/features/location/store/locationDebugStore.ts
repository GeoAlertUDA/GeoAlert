import { create } from 'zustand';

type LocationPermissionStatus = 'unknown' | 'granted' | 'denied' | 'undetermined';

interface LocationDebugState {
  foregroundPermission: LocationPermissionStatus;
  backgroundPermission: LocationPermissionStatus;
  isTaskRegistered: boolean;
  hasStartedLocationUpdates: boolean;
  activeAlarmsCount: number;
  lastLocationAt: string | null;
  lastLocation: {
    latitude: number;
    longitude: number;
  } | null;
  lastEvaluatedAlarmId: number | null;
  lastTriggeredAlarmId: number | null;
  lastTriggeredAt: string | null;
  lastEvent: string | null;
  lastError: string | null;
  setDebugState: (state: Partial<Omit<LocationDebugState, 'setDebugState'>>) => void;
}

export const useLocationDebugStore = create<LocationDebugState>((set) => ({
  foregroundPermission: 'unknown',
  backgroundPermission: 'unknown',
  isTaskRegistered: false,
  hasStartedLocationUpdates: false,
  activeAlarmsCount: 0,
  lastLocationAt: null,
  lastLocation: null,
  lastEvaluatedAlarmId: null,
  lastTriggeredAlarmId: null,
  lastTriggeredAt: null,
  lastEvent: null,
  lastError: null,
  setDebugState: (state) => set(state),
}));
