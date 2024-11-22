import { openDB } from 'idb';

const DB_NAME = 'presentoirs-app';
const DB_VERSION = 1;

const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache');
      }
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences');
      }
    },
  });
};

export const cacheManager = {
  async set(key: string, value: any) {
    const db = await getDB();
    await db.put('cache', value, key);
  },

  async get(key: string) {
    const db = await getDB();
    return db.get('cache', key);
  },

  async delete(key: string) {
    const db = await getDB();
    await db.delete('cache', key);
  },

  async clear() {
    const db = await getDB();
    await db.clear('cache');
  }
};

export const preferencesManager = {
  async setPreference(key: string, value: any) {
    const db = await getDB();
    await db.put('preferences', value, key);
  },

  async getPreference(key: string) {
    const db = await getDB();
    return db.get('preferences', key);
  },

  async deletePreference(key: string) {
    const db = await getDB();
    await db.delete('preferences', key);
  }
};