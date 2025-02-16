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

export interface Context {
  requestId: string;
}

type Resolver<TResult, TParent = any, TContext = Context, TArgs = Record<string, any>> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export interface QueryResolvers<TContext = Context> {
  earthquakes: Resolver<Earthquake[], any, TContext>;
  earthquake: Resolver<Earthquake | null, any, TContext, { id: number }>;
}

export interface MutationResolvers<TContext = Context> {
  createEarthquake: Resolver<Earthquake, any, TContext, { input: CreateEarthquakeInput }>;
  updateEarthquake: Resolver<
    Earthquake,
    any,
    TContext,
    { id: number; input: UpdateEarthquakeInput }
  >;
  deleteEarthquake: Resolver<boolean, any, TContext, { id: number }>;
}

export interface Resolvers<TContext = Context> {
  Query: QueryResolvers<TContext>;
  Mutation: MutationResolvers<TContext>;
}
