import { SQLiteDatabase } from "expo-sqlite";
import { IAlarm } from "../../features/alarm/types/IAlarm";

export const createAlarmTable = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS alarm (
      id              INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name            TEXT    NOT NULL,
      latitude        REAL    NOT NULL,
      longitude       REAL    NOT NULL,
      radius          REAL    NOT NULL,
      isActive        INTEGER NOT NULL DEFAULT 1,
      isFavorite      INTEGER NOT NULL DEFAULT 0,
      soundEnabled    INTEGER NOT NULL DEFAULT 1,
      vibrationEnabled INTEGER NOT NULL DEFAULT 1,
      isRinging       INTEGER NOT NULL DEFAULT 0,
      address         TEXT
    );
  `);
  await ensureAlarmColumn(db, "soundEnabled", "INTEGER NOT NULL DEFAULT 1");
  await ensureAlarmColumn(db, "vibrationEnabled", "INTEGER NOT NULL DEFAULT 1");
  await ensureAlarmColumn(db, "isRinging", "INTEGER NOT NULL DEFAULT 0");
};

const ensureAlarmColumn = async (
  db: SQLiteDatabase,
  columnName: string,
  definition: string,
): Promise<void> => {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(alarm);`,
  );
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    await db.execAsync(
      `ALTER TABLE alarm ADD COLUMN ${columnName} ${definition};`,
    );
  }
};

export const dropAlarmTable = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`DROP TABLE IF EXISTS alarm;`);
};

const rowToAlarm = (row: Record<string, unknown>): IAlarm => ({
  id: row.id as number,
  name: row.name as string,
  latitude: row.latitude as number,
  longitude: row.longitude as number,
  radius: row.radius as number,
  isActive: (row.isActive as number) === 1,
  isFavorite: (row.isFavorite as number) === 1,
  soundEnabled: ((row.soundEnabled as number | undefined) ?? 1) === 1,
  vibrationEnabled: ((row.vibrationEnabled as number | undefined) ?? 1) === 1,
  isRinging: ((row.isRinging as number | undefined) ?? 0) === 1,
  address: row.address as string | null,
});

export const getAllAlarms = async (db: SQLiteDatabase): Promise<IAlarm[]> => {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM alarm ORDER BY name ASC;`,
  );
  return rows.map(rowToAlarm);
};

export const getActiveAlarms = async (db: SQLiteDatabase): Promise<IAlarm[]> => {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM alarm WHERE isActive = 1 ORDER BY name ASC;`,
  );
  return rows.map(rowToAlarm);
};

export const getAlarmById = async (
  db: SQLiteDatabase,
  id: number,
): Promise<IAlarm | null> => {
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT * FROM alarm WHERE id = ?;`,
    id,
  );
  return row ? rowToAlarm(row) : null;
};

export const insertAlarm = async (
  db: SQLiteDatabase,
  alarm: Omit<IAlarm, "id">,
): Promise<number> => {
  const result = await db.runAsync(
    `INSERT INTO alarm (
       name, latitude, longitude, radius, isActive, isFavorite,
       soundEnabled, vibrationEnabled, isRinging, address
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    alarm.name,
    alarm.latitude,
    alarm.longitude,
    alarm.radius,
    alarm.isActive ? 1 : 0,
    alarm.isFavorite ? 1 : 0,
    alarm.soundEnabled ? 1 : 0,
    alarm.vibrationEnabled ? 1 : 0,
    alarm.isRinging ? 1 : 0,
    alarm.address ?? null,
  );
  return result.lastInsertRowId;
};

export const updateAlarm = async (
  db: SQLiteDatabase,
  alarm: IAlarm,
): Promise<void> => {
  await db.runAsync(
    `UPDATE alarm
     SET name = ?, latitude = ?, longitude = ?, radius = ?,
         isActive = ?, isFavorite = ?, soundEnabled = ?,
         vibrationEnabled = ?, isRinging = ?, address = ?
     WHERE id = ?;`,
    alarm.name,
    alarm.latitude,
    alarm.longitude,
    alarm.radius,
    alarm.isActive ? 1 : 0,
    alarm.isFavorite ? 1 : 0,
    alarm.soundEnabled ? 1 : 0,
    alarm.vibrationEnabled ? 1 : 0,
    alarm.isRinging ? 1 : 0,
    alarm.address ?? null,
    alarm.id,
  );
};

export const deleteAlarm = async (
  db: SQLiteDatabase,
  id: number,
): Promise<void> => {
  await db.runAsync(`DELETE FROM alarm WHERE id = ?;`, id);
};

export const toggleAlarmActive = async (
  db: SQLiteDatabase,
  id: number,
  currentValue: boolean,
): Promise<void> => {
  await db.runAsync(
    `UPDATE alarm SET isActive = ? WHERE id = ?;`,
    currentValue ? 0 : 1,
    id,
  );
};

export const setAlarmActive = async (
  db: SQLiteDatabase,
  id: number,
  isActive: boolean,
): Promise<void> => {
  await db.runAsync(
    `UPDATE alarm SET isActive = ? WHERE id = ?;`,
    isActive ? 1 : 0,
    id,
  );
};

export const setAlarmRinging = async (
  db: SQLiteDatabase,
  id: number,
  isRinging: boolean,
): Promise<void> => {
  await db.runAsync(
    `UPDATE alarm SET isRinging = ? WHERE id = ?;`,
    isRinging ? 1 : 0,
    id,
  );
};

export const toggleAlarmFavorite = async (
  db: SQLiteDatabase,
  id: number,
  currentValue: boolean,
): Promise<void> => {
  await db.runAsync(
    `UPDATE alarm SET isFavorite = ? WHERE id = ?;`,
    currentValue ? 0 : 1,
    id,
  );
};
