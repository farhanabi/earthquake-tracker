import { eq } from 'drizzle-orm';
import type { GraphQLResolveInfo } from 'graphql';

import { testDb, setup, cleanup } from '../../../test/setup';
import { earthquakes } from '../../db/schema';
import { resolvers } from '../resolvers';

describe('GraphQL Resolvers', () => {
  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    await testDb.delete(earthquakes);

    await testDb.insert(earthquakes).values([
      {
        location: 'Test Location 1',
        magnitude: 5.5,
        date: new Date('2024-01-01').toISOString(),
      },
      {
        location: 'Test Location 2',
        magnitude: 6.0,
        date: new Date('2024-01-02').toISOString(),
      },
    ]);
  });

  afterEach(async () => {
    await testDb.delete(earthquakes);
  });

  describe('Query resolvers', () => {
    it('should fetch all earthquakes with pagination', async () => {
      const result = await resolvers.Query.earthquakes?.(
        {},
        { page: 1, pageSize: 10 },
        { requestId: 'test' },
        {} as GraphQLResolveInfo
      );

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should fetch earthquakes with filters', async () => {
      const result = await resolvers.Query.earthquakes?.(
        {},
        {
          filter: {
            minMagnitude: 6.0,
          },
        },
        { requestId: 'test' },
        {} as GraphQLResolveInfo
      );

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].magnitude).toBe(6.0);
    });

    it('should fetch a single earthquake by id', async () => {
      const earthquakesData = await testDb.select().from(earthquakes);
      const firstId = earthquakesData[0].id;

      const result = await resolvers.Query.earthquake?.(
        {},
        { id: firstId },
        { requestId: 'test' },
        {} as GraphQLResolveInfo
      );

      expect(result).toBeDefined();
      expect(result?.location).toBe('Test Location 1');
    });
  });

  describe('Mutation resolvers', () => {
    it('should create a new earthquake', async () => {
      const result = await resolvers.Mutation.createEarthquake?.(
        {},
        {
          input: {
            location: 'New Test Location',
            magnitude: 4.5,
            date: new Date('2024-01-03').toISOString(),
          },
        },
        { requestId: 'test' },
        {} as GraphQLResolveInfo
      );

      expect(result).toBeDefined();
      expect(result.location).toBe('New Test Location');
      expect(result.magnitude).toBe(4.5);

      const created = await testDb
        .select()
        .from(earthquakes)
        .where(eq(earthquakes.location, 'New Test Location'));
      expect(created).toHaveLength(1);
    });

    it('should update an existing earthquake', async () => {
      const [existingEarthquake] = await testDb.select().from(earthquakes);

      const result = await resolvers.Mutation.updateEarthquake?.(
        {},
        {
          id: existingEarthquake.id,
          input: {
            magnitude: 5.8,
          },
        },
        { requestId: 'test' },
        {} as GraphQLResolveInfo
      );

      expect(result).toBeDefined();
      expect(result.magnitude).toBe(5.8);

      const updated = await testDb
        .select()
        .from(earthquakes)
        .where(eq(earthquakes.id, existingEarthquake.id));
      expect(updated[0].magnitude).toBe(5.8);
    });

    it('should delete an earthquake', async () => {
      const [existingEarthquake] = await testDb.select().from(earthquakes);

      const result = await resolvers.Mutation.deleteEarthquake?.(
        {},
        { id: existingEarthquake.id },
        { requestId: 'test' },
        {} as GraphQLResolveInfo
      );

      expect(result).toBe(true);

      const deleted = await testDb
        .select()
        .from(earthquakes)
        .where(eq(earthquakes.id, existingEarthquake.id));
      expect(deleted).toHaveLength(0);
    });

    it('should validate magnitude range', async () => {
      await expect(
        resolvers.Mutation.createEarthquake?.(
          {},
          {
            input: {
              location: 'Invalid Magnitude',
              magnitude: 11.0,
              date: new Date().toISOString(),
            },
          },
          { requestId: 'test' },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrow('Magnitude must be between 0 and 10');
    });

    it('should handle not found errors when updating', async () => {
      await expect(
        resolvers.Mutation.updateEarthquake?.(
          {},
          {
            id: 99999,
            input: {
              magnitude: 5.8,
            },
          },
          { requestId: 'test' },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrow('Earthquake with ID 99999 not found');
    });

    it('should handle not found errors when deleting', async () => {
      await expect(
        resolvers.Mutation.deleteEarthquake?.(
          {},
          { id: 99999 },
          { requestId: 'test' },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrow('Earthquake with ID 99999 not found');
    });
  });
});
