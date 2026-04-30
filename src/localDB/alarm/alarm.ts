import { SQLiteDatabase } from "expo-sqlite";
import { IAlarm } from "../../types/IAlarm";

export const createAlarmTable = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS alarm (
      id              INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name            TEXT    ,
      latitude        REAL    NOT NULL,
      longitude       REAL    NOT NULL,
      radius          REAL    NOT NULL,
      isActive        INTEGER NOT NULL DEFAULT 1,
      isFavorite      INTEGER NOT NULL DEFAULT 0,
      address         TEXT
    );
  `);
};

export const dropAlarmTable = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`DROP TABLE IF EXISTS alarm;`);
};

const rowToAlarm = (row: Record<string, unknown>): IAlarm => ({
  id: row.id as number,
  name: row.name as string | null,
  latitude: row.latitude as number,
  longitude: row.longitude as number,
  radius: row.radius as number,
  isActive: (row.isActive as number) === 1,
  isFavorite: (row.isFavorite as number) === 1,
  address: row.address as string | null,
});

export const getAllAlarms = async (db: SQLiteDatabase): Promise<IAlarm[]> => {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM alarm ORDER BY name ASC;`,
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
    `INSERT INTO alarm (name, latitude, longitude, radius, isActive, isFavorite, address)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    alarm.name ?? null,
    alarm.latitude,
    alarm.longitude,
    alarm.radius,
    alarm.isActive ? 1 : 0,
    alarm.isFavorite ? 1 : 0,
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
         isActive = ?, isFavorite = ?, address = ?
     WHERE id = ?;`,
    alarm.name ?? null,
    alarm.latitude,
    alarm.longitude,
    alarm.radius,
    alarm.isActive ? 1 : 0,
    alarm.isFavorite ? 1 : 0,
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
  const willBeActive = !currentValue;

  if (willBeActive) {
    await db.runAsync(`UPDATE alarm SET isActive = 0;`);
  }

  await db.runAsync(
    `UPDATE alarm SET isActive = ? WHERE id = ?;`,
    willBeActive ? 1 : 0,
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
