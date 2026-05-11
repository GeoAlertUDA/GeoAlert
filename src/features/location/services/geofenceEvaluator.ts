import type { IAlarm } from '@/features/alarm/types/IAlarm';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeofenceEvaluation {
  alarm: IAlarm;
  distanceMeters: number;
  isInside: boolean;
}

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function getDistanceMeters(from: Coordinates, to: Coordinates): number {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function evaluateActiveAlarms(
  userLocation: Coordinates,
  alarms: IAlarm[],
): GeofenceEvaluation[] {
  return alarms.map((alarm) => {
    const distanceMeters = getDistanceMeters(userLocation, {
      latitude: alarm.latitude,
      longitude: alarm.longitude,
    });

    return {
      alarm,
      distanceMeters,
      isInside: distanceMeters <= alarm.radius,
    };
  });
}
