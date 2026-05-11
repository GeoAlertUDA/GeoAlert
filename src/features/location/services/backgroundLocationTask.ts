import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getActiveAlarms } from '@/localDB/alarm/alarm';
import { getDBConnection } from '@/localDB/db';
import { BACKGROUND_LOCATION_OPTIONS, BACKGROUND_LOCATION_TASK, GEOFENCE_HYSTERESIS_METERS } from '../constants';
import { getBackgroundLocationPermissionState } from '../permissions/locationPermissions';
import { useLocationDebugStore } from '../store/locationDebugStore';
import { evaluateActiveAlarms } from './geofenceEvaluator';

const triggeredAlarmIds = new Set<number>();

const setDebugState = useLocationDebugStore.getState().setDebugState;

async function updateTaskDebug() {
  const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  const hasStartedLocationUpdates = isTaskRegistered
    ? await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
    : false;

  setDebugState({
    isTaskRegistered,
    hasStartedLocationUpdates,
  });
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    setDebugState({
      lastError: String(error.message ?? error),
      lastEvent: 'background task error',
    });
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] } | undefined)?.locations;
  const location = locations?.[0];

  if (!location) {
    setDebugState({ lastEvent: 'background task without location' });
    return;
  }

  const db = await getDBConnection();
  const activeAlarms = await getActiveAlarms(db);
  const currentLocation = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
  const evaluations = evaluateActiveAlarms(currentLocation, activeAlarms);
  const enteredAlarm = evaluations.find((evaluation) => {
    if (evaluation.isInside && !triggeredAlarmIds.has(evaluation.alarm.id)) {
      return true;
    }

    if (evaluation.distanceMeters > evaluation.alarm.radius + GEOFENCE_HYSTERESIS_METERS) {
      triggeredAlarmIds.delete(evaluation.alarm.id);
    }

    return false;
  });

  if (enteredAlarm) {
    triggeredAlarmIds.add(enteredAlarm.alarm.id);
    console.log('[GeoAlert] Entered alarm radius:', {
      alarmId: enteredAlarm.alarm.id,
      distanceMeters: Math.round(enteredAlarm.distanceMeters),
    });
  }

  setDebugState({
    activeAlarmsCount: activeAlarms.length,
    lastLocation: currentLocation,
    lastLocationAt: new Date().toISOString(),
    lastEvaluatedAlarmId: evaluations[0]?.alarm.id ?? null,
    lastTriggeredAlarmId: enteredAlarm?.alarm.id ?? null,
    lastTriggeredAt: enteredAlarm ? new Date().toISOString() : useLocationDebugStore.getState().lastTriggeredAt,
    lastEvent: enteredAlarm ? 'entered alarm radius' : 'location update evaluated',
    lastError: null,
  });
});

export async function ensureBackgroundLocationTaskRegistered() {
  const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);

  if (!isTaskRegistered) {
    setDebugState({ lastEvent: 'background task registered' });
  }

  await updateTaskDebug();
}

export async function stopBackgroundLocationUpdates() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }

  setDebugState({
    hasStartedLocationUpdates: false,
    lastEvent: 'background tracking stopped',
  });
}

export async function syncBackgroundLocationTracking() {
  await ensureBackgroundLocationTaskRegistered();

  const db = await getDBConnection();
  const activeAlarms = await getActiveAlarms(db);
  const permissionState = await getBackgroundLocationPermissionState();

  setDebugState({
    activeAlarmsCount: activeAlarms.length,
  });

  if (activeAlarms.length === 0) {
    await stopBackgroundLocationUpdates();
    return;
  }

  if (!permissionState.backgroundGranted) {
    setDebugState({
      hasStartedLocationUpdates: false,
      lastEvent: 'background permission missing',
    });
    return;
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: BACKGROUND_LOCATION_OPTIONS.timeInterval,
      distanceInterval: BACKGROUND_LOCATION_OPTIONS.distanceInterval,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'GeoAlert está monitoreando alarmas',
        notificationBody: 'Evaluando alarmas activas en segundo plano.',
        notificationColor: '#0D393C',
      },
    });
  }

  setDebugState({
    hasStartedLocationUpdates: true,
    lastEvent: hasStarted ? 'background tracking already running' : 'background tracking started',
    lastError: null,
  });

  await updateTaskDebug();
}
