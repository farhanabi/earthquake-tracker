import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const earthquakes = sqliteTable(
  'earthquakes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    location: text('location').notNull(),
    magnitude: real('magnitude').notNull(),
    date: text('date')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_earthquakes_location').on(table.location),
    index('idx_earthquakes_magnitude').on(table.magnitude),
    index('idx_earthquakes_date').on(table.date),
  ]
);
