import { GraphQLResolveInfo } from 'graphql';

export interface Earthquake {
  id: number;
  location: string;
  magnitude: number;
  date: string;
}

export enum SortField {
  DATE = 'DATE',
  MAGNITUDE = 'MAGNITUDE',
  LOCATION = 'LOCATION',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface SortInput {
  field: SortField;
  order: SortOrder;
}

export interface FilterInput {
  search?: string;
  minMagnitude?: number;
  maxMagnitude?: number;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedEarthquakes {
  data: Earthquake[];
  total: number;
  pageSize: number;
  page: number;
  totalPages: number;
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

export interface QueryArgs {
  page?: number;
  pageSize?: number;
  sort?: SortInput;
  filter?: FilterInput;
}

type Resolver<TResult, TParent = any, TContext = Context, TArgs = Record<string, any>> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export interface QueryResolvers<TContext = Context> {
  earthquakes: Resolver<PaginatedEarthquakes, any, TContext, QueryArgs>;
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
