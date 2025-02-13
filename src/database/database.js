import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let database = null;

export const getDb = async () => {
  if (!database) {
    database = await open({
      filename: 'database.db',
      driver: sqlite3.Database,
    });
  }
  return database;
};
