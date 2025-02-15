import { eq } from 'drizzle-orm';

import { db } from '../db';
import { earthquakes } from '../db/schema';
import { Resolvers, CreateEarthquakeInput, UpdateEarthquakeInput } from './types';

export const resolvers: Resolvers = {
  Query: {
    earthquakes: async () => {
      return await db.select().from(earthquakes);
    },
    earthquake: async (_, { id }) => {
      const results = await db.select().from(earthquakes).where(eq(earthquakes.id, id));
      return results[0] || null;
    },
  },
  Mutation: {
    createEarthquake: async (_, { input }) => {
      const [earthquake] = await db
        .insert(earthquakes)
        .values(input as CreateEarthquakeInput)
        .returning();
      return earthquake;
    },
    updateEarthquake: async (_, { id, input }) => {
      const [updated] = await db
        .update(earthquakes)
        .set(input as UpdateEarthquakeInput)
        .where(eq(earthquakes.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Earthquake with ID ${id} not found`);
      }

      return updated;
    },
    deleteEarthquake: async (_, { id }) => {
      const [deleted] = await db.delete(earthquakes).where(eq(earthquakes.id, id)).returning();

      return !!deleted;
    },
  },
};
