import { gql } from '@apollo/client';

export const GET_EARTHQUAKES = gql`
  query GetEarthquakes {
    earthquakes {
      id
      location
      magnitude
      date
    }
  }
`;

export const GET_EARTHQUAKE = gql`
  query GetEarthquake($id: Int!) {
    earthquake(id: $id) {
      id
      location
      magnitude
      date
    }
  }
`;

export const CREATE_EARTHQUAKE = gql`
  mutation CreateEarthquake($input: CreateEarthquakeInput!) {
    createEarthquake(input: $input) {
      id
      location
      magnitude
      date
    }
  }
`;

export const UPDATE_EARTHQUAKE = gql`
  mutation UpdateEarthquake($id: Int!, $input: UpdateEarthquakeInput!) {
    updateEarthquake(id: $id, input: $input) {
      id
      location
      magnitude
      date
    }
  }
`;

export const DELETE_EARTHQUAKE = gql`
  mutation DeleteEarthquake($id: Int!) {
    deleteEarthquake(id: $id)
  }
`;

export type Earthquake = {
  id: number;
  location: string;
  magnitude: number;
  date: string;
};

export type CreateEarthquakeInput = Omit<Earthquake, 'id'>;
export type UpdateEarthquakeInput = Partial<CreateEarthquakeInput>;
