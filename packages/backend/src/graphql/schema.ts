export const typeDefs = `#graphql
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
    earthquakes(page: Int = 1, pageSize: Int = 10): PaginatedEarthquakes!
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
