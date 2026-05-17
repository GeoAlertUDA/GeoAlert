import type { IAlarm } from "../types/IAlarm";

/** Máximo de alarmas activas simultáneas (mapa, rutas y geofencing). */
export const MAX_ACTIVE_ALARMS = 5;

export function countActiveAlarms(
  alarms: Pick<IAlarm, "isActive">[],
): number {
  return alarms.filter((a) => a.isActive).length;
}

export function isAtActiveAlarmLimit(alarms: Pick<IAlarm, "isActive">[]): boolean {
  return countActiveAlarms(alarms) >= MAX_ACTIVE_ALARMS;
}

export const MAX_ACTIVE_ALARMS_LIMIT_ERROR = "MAX_ACTIVE_ALARMS_LIMIT";

export function isMaxActiveAlarmsLimitError(e: unknown): boolean {
  return (
    e instanceof Error && e.message === MAX_ACTIVE_ALARMS_LIMIT_ERROR
  );
}
