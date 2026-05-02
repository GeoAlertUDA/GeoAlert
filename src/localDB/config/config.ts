import { SQLiteDatabase } from 'expo-sqlite';
import { IConfig } from '../../types/IConfig';


export const createConfigTable = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS config (
      id                INTEGER PRIMARY KEY NOT NULL DEFAULT 1,
      vibrate           INTEGER NOT NULL DEFAULT 0,
      progressiveVolume INTEGER NOT NULL DEFAULT 0,
      batterySave       INTEGER NOT NULL DEFAULT 0,
      mobileInternet    INTEGER NOT NULL DEFAULT 1
    );
  `);
};

export const dropConfigTable = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`DROP TABLE IF EXISTS config;`);
};


const rowToConfig = (row: Record<string, unknown>): IConfig => ({
  id:                row.id as number,
  vibrate:           (row.vibrate as number) === 1,
  progressiveVolume: (row.progressiveVolume as number) === 1,
  batterySave:       (row.batterySave as number) === 1,
  mobileInternet:    (row.mobileInternet as number) === 1,
});


export const getConfig = async (
  db: SQLiteDatabase,
): Promise<IConfig | null> => {
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT * FROM config WHERE id = 1;`,
  );
  return row ? rowToConfig(row) : null;
};


export const saveConfig = async (
  db: SQLiteDatabase,
  config: Omit<IConfig, 'id'>,
): Promise<void> => {
  await db.runAsync(
    `INSERT INTO config (id, vibrate, progressiveVolume, batterySave, mobileInternet)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       vibrate           = excluded.vibrate,
       progressiveVolume = excluded.progressiveVolume,
       batterySave       = excluded.batterySave,
       mobileInternet    = excluded.mobileInternet;`,
    config.vibrate           ? 1 : 0,
    config.progressiveVolume ? 1 : 0,
    config.batterySave       ? 1 : 0,
    config.mobileInternet    ? 1 : 0,
  );
};

export const updateConfigField = async (
  db: SQLiteDatabase,
  field: keyof Omit<IConfig, 'id'>,
  value: boolean,
): Promise<void> => {
  await db.runAsync(
    `UPDATE config SET ${field} = ? WHERE id = 1;`,
    value ? 1 : 0,
  );
};
