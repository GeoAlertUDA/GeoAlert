import * as SQLite from 'expo-sqlite';
import { createAlarmTable } from './alarm/alarm';
import { createConfigTable } from './config/config';


let _db: SQLite.SQLiteDatabase | null = null;

export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('geoalert.db');
  }
  return _db;
};

export const createTables = async (): Promise<void> => {
  const db = await getDBConnection();
  await createAlarmTable(db);
  await createConfigTable(db);
};

export const dropTables = async (): Promise<void> => {
  const db = await getDBConnection();

  await db.execAsync(`DROP TABLE IF EXISTS alarm;`);
  await db.execAsync(`DROP TABLE IF EXISTS config;`);
};
