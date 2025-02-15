import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import fs from 'fs/promises';
import Papa from 'papaparse';
import path from 'path';

import * as schema from '../db/schema';

async function seed() {
  // Initialize DB connection
  const client = createClient({
    url: process.env.DB_URL || 'file:local.db',
  });
  const db = drizzle(client, { schema });

  try {
    // Read CSV file
    const csvContent = await fs.readFile(
      path.join(__dirname, '../../data/earthquakes1970-2014.csv'),
      'utf-8',
    );

    // Parse CSV
    const { data } = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Transform data to match our schema
    const earthquakeData = data.map((row: any) => ({
      location: `${row.Latitude}, ${row.Longitude}`,
      magnitude: parseFloat(row.Magnitude),
      date: new Date(row.DateTime).toISOString(),
    }));

    // Insert data in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < earthquakeData.length; i += BATCH_SIZE) {
      const batch = earthquakeData.slice(i, i + BATCH_SIZE);
      await db.insert(schema.earthquakes).values(batch);
    }

    console.log(`Successfully seeded ${earthquakeData.length} earthquakes`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }

  await client.close();
  process.exit(0);
}

seed();
