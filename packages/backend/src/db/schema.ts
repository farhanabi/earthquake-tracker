import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const earthquakes = sqliteTable('earthquakes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  location: text('location').notNull(),
  magnitude: real('magnitude').notNull(),
  date: text('date')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
