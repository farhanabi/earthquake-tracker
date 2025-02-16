export const typeDefs = `#graphql
  enum SortField {
    DATE
    MAGNITUDE
    LOCATION
  }

  enum SortOrder {
    ASC
    DESC
  }

  input SortInput {
    field: SortField!
    order: SortOrder!
  }

  input FilterInput {
    search: String
    minMagnitude: Float
    maxMagnitude: Float
    fromDate: String
    toDate: String
  }

  type Earthquake {
    id: Int!
    location: String!
    magnitude: Float!
    date: String!
  }

  type PaginatedEarthquakes {
    data: [Earthquake!]!
    total: Int!
    pageSize: Int!
    page: Int!
    totalPages: Int!
  }

  type Query {
    earthquakes(
      page: Int = 1
      pageSize: Int = 10
      sort: SortInput
      filter: FilterInput
    ): PaginatedEarthquakes!
    earthquake(id: Int!): Earthquake
  }

  input CreateEarthquakeInput {
    location: String!
    magnitude: Float!
    date: String
  }

  input UpdateEarthquakeInput {
    location: String
    magnitude: Float
    date: String
  }

  type Mutation {
    createEarthquake(input: CreateEarthquakeInput!): Earthquake!
    updateEarthquake(id: Int!, input: UpdateEarthquakeInput!): Earthquake!
    deleteEarthquake(id: Int!): Boolean!
  }
`;
