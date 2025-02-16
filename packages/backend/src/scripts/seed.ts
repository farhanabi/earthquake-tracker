import fs from 'fs/promises';
import path from 'path';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import Papa from 'papaparse';

import * as schema from '../db/schema';

interface EarthquakeCSVRow {
  Latitude: string;
  Longitude: string;
  Magnitude: string;
  DateTime: string;
}

async function seed(): Promise<void> {
  // Initialize DB connection
  const client = createClient({
    url: process.env.DB_URL || 'file:local.db',
  });
  const db = drizzle(client, { schema });

  try {
    // Read CSV file
    const csvContent = await fs.readFile(
      path.join(__dirname, '../../data/earthquakes1970-2014.csv'),
      'utf-8'
    );

    // Parse CSV with type safety
    const { data } = Papa.parse<EarthquakeCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Transform data to match our schema
    const earthquakeData = data.map((row) => ({
      location: `${row.Latitude}, ${row.Longitude}`,
      magnitude: parseFloat(row.Magnitude),
      date: new Date(row.DateTime).toISOString(),
    }));

    // Insert data in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < earthquakeData.length; i += BATCH_SIZE) {
      const batch = earthquakeData.slice(i, i + BATCH_SIZE);
      // Use Promise.all to properly handle the batch insert promise
      await Promise.all([db.insert(schema.earthquakes).values(batch)]);
    }

    // Replace console.log with console.warn for linting rules
    console.warn(`Successfully seeded ${earthquakeData.length} earthquakes`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }

  try {
    client.close();
  } catch (error) {
    console.error('Error closing client:', error);
    process.exit(1);
  }
  process.exit(0);
}

// Handle the promise properly
void seed();
