// src/graphql/types.ts
import { GraphQLResolveInfo } from 'graphql';

export interface Earthquake {
  id: number;
  location: string;
  magnitude: number;
  date: string;
}

export interface CreateEarthquakeInput {
  location: string;
  magnitude: number;
  date?: string;
}

export interface UpdateEarthquakeInput {
  location?: string;
  magnitude?: number;
  date?: string;
}

export interface ResolverContext {}

type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export interface QueryResolvers {
  earthquakes: Resolver<Earthquake[], {}, ResolverContext>;
  earthquake: Resolver<Earthquake | null, {}, ResolverContext, { id: number }>;
}

export interface MutationResolvers {
  createEarthquake: Resolver<Earthquake, {}, ResolverContext, { input: CreateEarthquakeInput }>;
  updateEarthquake: Resolver<
    Earthquake,
    {},
    ResolverContext,
    { id: number; input: UpdateEarthquakeInput }
  >;
  deleteEarthquake: Resolver<boolean, {}, ResolverContext, { id: number }>;
}

export interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  [key: string]: any; // Add index signature for additional resolvers
}
