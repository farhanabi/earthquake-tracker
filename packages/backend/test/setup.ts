import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from '../src/db/schema';

process.env.DB_URL = 'file:test.db';
process.env.NODE_ENV = 'test';

export const testClient = createClient({
  url: 'file:test.db',
});

export const testDb = drizzle(testClient, { schema });

export async function cleanup(): Promise<void> {
  try {
    await testClient.execute('DROP TABLE IF EXISTS earthquakes');
    testClient.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

export async function setup(): Promise<void> {
  try {
    await testClient.execute(`
      CREATE TABLE IF NOT EXISTS earthquakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        magnitude REAL NOT NULL,
        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Error during setup:', error);
    throw error;
  }
}
