import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { GraphQLError } from 'graphql';

import { db } from '../db';
import { earthquakes } from '../db/schema';

import { QueryArgs, Resolvers, SortField, SortOrder } from './types';

const validateMagnitude = (magnitude: number): void => {
  if (magnitude < 0 || magnitude > 10) {
    throw new GraphQLError('Magnitude must be between 0 and 10', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
};

const validateDate = (date: string): void => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new GraphQLError('Invalid date format', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
};

export const resolvers: Resolvers = {
  Query: {
    earthquakes: async (_, { page = 1, pageSize = 10, sort, filter }: QueryArgs) => {
      try {
        const validatedPage = Math.max(1, page);
        const validatedPageSize = Math.min(Math.max(1, pageSize), 100);
        const offset = (validatedPage - 1) * validatedPageSize;

        const conditions = [];
        if (filter) {
          if (filter.search) {
            conditions.push(sql`(
              SUBSTR(TRIM(SUBSTR(location, 1, INSTR(location, ',') - 1)), 1, ${filter.search.length}) = ${filter.search}
              OR
              SUBSTR(TRIM(SUBSTR(location, INSTR(location, ',') + 1)), 1, ${filter.search.length}) = ${filter.search}
            )`);
          }
          if (filter.minMagnitude !== undefined) {
            conditions.push(gte(earthquakes.magnitude, filter.minMagnitude));
          }
          if (filter.maxMagnitude !== undefined) {
            conditions.push(lte(earthquakes.magnitude, filter.maxMagnitude));
          }
          if (filter.fromDate) {
            conditions.push(gte(earthquakes.date, filter.fromDate));
          }
          if (filter.toDate) {
            conditions.push(lte(earthquakes.date, filter.toDate));
          }
        }

        let orderBy = sql`${earthquakes.date} DESC`;
        if (sort) {
          const direction = sort.order === SortOrder.ASC ? 'ASC' : 'DESC';
          switch (sort.field) {
            case SortField.DATE:
              orderBy = sql`${earthquakes.date} ${sql.raw(direction)}`;
              break;
            case SortField.MAGNITUDE:
              orderBy = sql`${earthquakes.magnitude} ${sql.raw(direction)}`;
              break;
            case SortField.LOCATION:
              orderBy = sql`${earthquakes.location} ${sql.raw(direction)}`;
              break;
          }
        }

        const countQuery =
          conditions.length > 0
            ? db
                .select({ count: sql<number>`count(*)` })
                .from(earthquakes)
                .where(and(...conditions))
            : db.select({ count: sql<number>`count(*)` }).from(earthquakes);

        const [countResult] = await countQuery;
        const count = countResult.count;

        const dataQuery =
          conditions.length > 0
            ? db
                .select()
                .from(earthquakes)
                .where(and(...conditions))
            : db.select().from(earthquakes);

        const data = await dataQuery.orderBy(orderBy).limit(validatedPageSize).offset(offset);

        const totalPages = Math.ceil(count / validatedPageSize);

        return {
          data,
          total: count,
          pageSize: validatedPageSize,
          page: validatedPage,
          totalPages,
        };
      } catch (error) {
        console.error('Error in earthquakes resolver:', error);
        throw new GraphQLError('Failed to fetch earthquakes', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
    earthquake: async (_, { id }) => {
      try {
        const results = await db.select().from(earthquakes).where(eq(earthquakes.id, id));
        if (!results.length) {
          throw new GraphQLError(`Earthquake with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        return results[0];
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch earthquake', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
  Mutation: {
    createEarthquake: async (_, { input }) => {
      try {
        validateMagnitude(input.magnitude);
        if (input.date) validateDate(input.date);

        const [earthquake] = await db
          .insert(earthquakes)
          .values({
            ...input,
            date: input.date || new Date().toISOString(),
          })
          .returning();

        return earthquake;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to create earthquake', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
    updateEarthquake: async (_, { id, input }) => {
      try {
        if (input.magnitude !== undefined) {
          validateMagnitude(input.magnitude);
        }
        if (input.date) {
          validateDate(input.date);
        }

        const [updated] = await db
          .update(earthquakes)
          .set(input)
          .where(eq(earthquakes.id, id))
          .returning();

        if (!updated) {
          throw new GraphQLError(`Earthquake with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return updated;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update earthquake', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
    deleteEarthquake: async (_, { id }) => {
      try {
        const [deleted] = await db.delete(earthquakes).where(eq(earthquakes.id, id)).returning();

        if (!deleted) {
          throw new GraphQLError(`Earthquake with ID ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return true;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to delete earthquake', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
};
