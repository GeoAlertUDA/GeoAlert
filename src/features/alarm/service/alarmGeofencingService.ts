import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { createTables, getDBConnection } from '@/localDB/db';
import {
  getAlarmById,
  getAllAlarms,
  setAlarmActive,
  setAlarmRinging,
} from '@/localDB/alarm/alarm';
import { triggerAlarmAlert } from '@/features/options/service/soundService';
import { useGlobalSettingsStore } from '@/features/options/store/globalSettingsStore';

export const ALARM_GEOFENCE_TASK = 'geoalert-alarm-geofence';

const ALARM_REGION_PREFIX = 'alarm:';
const MIN_GEOFENCE_RADIUS_METERS = 100;

type GeofenceTaskData = {
  eventType: Location.GeofencingEventType;
  region: Location.LocationRegion;
};

function alarmRegionIdentifier(alarmId: number) {
  return `${ALARM_REGION_PREFIX}${alarmId}`;
}

function alarmIdFromRegion(identifier?: string) {
  if (!identifier?.startsWith(ALARM_REGION_PREFIX)) return null;

  const id = Number(identifier.slice(ALARM_REGION_PREFIX.length));
  return Number.isFinite(id) ? id : null;
}

async function ensureBackgroundLocationPermissions(requestPermissions: boolean) {
  if (Platform.OS === 'web') return false;

  const foreground = await Location.getForegroundPermissionsAsync();
  let foregroundGranted = foreground.status === 'granted';

  if (!foregroundGranted && requestPermissions) {
    const requestedForeground = await Location.requestForegroundPermissionsAsync();
    foregroundGranted = requestedForeground.status === 'granted';
  }

  if (!foregroundGranted) return false;

  const background = await Location.getBackgroundPermissionsAsync();
  let backgroundGranted = background.status === 'granted';

  if (!backgroundGranted && requestPermissions) {
    Alert.alert(
      'Ubicación en segundo plano',
      'Para que la alarma suene con el teléfono bloqueado, GeoAlert necesita permiso de ubicación en segundo plano.',
    );

    const requestedBackground = await Location.requestBackgroundPermissionsAsync();
    backgroundGranted = requestedBackground.status === 'granted';
  }

  return backgroundGranted;
}

async function stopGeofencingIfStarted() {
  const started = await Location.hasStartedGeofencingAsync(ALARM_GEOFENCE_TASK);
  if (started) {
    await Location.stopGeofencingAsync(ALARM_GEOFENCE_TASK);
  }
}

export async function syncAlarmGeofences(
  options: { requestPermissions?: boolean } = {},
): Promise<boolean> {
  try {
    const taskManagerAvailable = await TaskManager.isAvailableAsync();
    if (!taskManagerAvailable) return false;

    await createTables();

    const db = await getDBConnection();
    const alarms = await getAllAlarms(db);
    const activeAlarms = alarms.filter((alarm) => alarm.isActive);

    if (activeAlarms.length === 0) {
      await stopGeofencingIfStarted();
      return true;
    }

    const hasPermissions = await ensureBackgroundLocationPermissions(
      options.requestPermissions ?? false,
    );

    if (!hasPermissions) return false;

    await stopGeofencingIfStarted();
    // Pequeña pausa para evitar condiciones de carrera al reiniciar geofencing (2ª alarma, etc.)
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 200);
    });

    await Location.startGeofencingAsync(
      ALARM_GEOFENCE_TASK,
      activeAlarms.map((alarm) => ({
        identifier: alarmRegionIdentifier(alarm.id),
        latitude: alarm.latitude,
        longitude: alarm.longitude,
        radius: Math.max(alarm.radius, MIN_GEOFENCE_RADIUS_METERS),
        notifyOnEnter: true,
        notifyOnExit: false,
      })),
    );

    return true;
  } catch (error) {
    console.warn('[alarmGeofencingService] No se pudo sincronizar geofences:', error);
    return false;
  }
}

if (!TaskManager.isTaskDefined(ALARM_GEOFENCE_TASK)) {
  TaskManager.defineTask<GeofenceTaskData>(ALARM_GEOFENCE_TASK, async ({ data, error }) => {
    if (error) {
      console.warn('[alarmGeofencingService] Error en tarea background:', error);
      return;
    }

    if (data.eventType !== Location.GeofencingEventType.Enter) return;

    const alarmId = alarmIdFromRegion(data.region.identifier);
    if (!alarmId) return;

    try {
      await createTables();

      const db = await getDBConnection();
      const alarm = await getAlarmById(db, alarmId);
      if (!alarm?.isActive) return;

      const { settings } = useGlobalSettingsStore.getState();
      await triggerAlarmAlert(settings, undefined, {
        soundEnabled: alarm.soundEnabled,
        vibrationEnabled: alarm.vibrationEnabled,
        repeatVibration: alarm.vibrationEnabled,
      });

      await setAlarmActive(db, alarm.id, false);
      await setAlarmRinging(db, alarm.id, true);
      await syncAlarmGeofences();
    } catch (taskError) {
      console.warn('[alarmGeofencingService] Error disparando alarma:', taskError);
    }
  });
}
