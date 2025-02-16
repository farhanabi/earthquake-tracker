# Earthquake Tracker

A full-stack application for tracking earthquakes, built with TypeScript, Node.js, Next.js, and Apollo Server.

## Tech Stack

### Backend

- Node.js with Express
- Apollo Server v4
- GraphQL
- SQLite with Drizzle ORM
- TypeScript

### Frontend

- Next.js 15
- Apollo Client
- Tailwind CSS
- shadcn/ui components
- TypeScript

## Prerequisites

- Node.js v20 or higher
- pnpm v8 or higher

## Getting Started

1. Clone the repository:

```bash
git clone git@github.com:farhanabi/earthquake-tracker.git
cd earthquake-tracker
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

For the backend (`packages/backend`):

```bash
cp .env.example .env
```

The default configuration uses SQLite with the following settings:

```
DB_URL=file:local.db
PORT=4000
```

## Database Setup

The application uses SQLite with Drizzle ORM. Follow these steps to set up your database:

1. Generate database migrations:

```bash
cd packages/backend
pnpm db:generate
```

2. Apply migrations:

```bash
pnpm db:push
```

3. Seed the database with initial earthquake data:

```bash
pnpm db:seed
```

## Running the Application

Run both the frontend and backend simultaneously with a single command from the root directory:

```bash
pnpm dev
```

The application will be available at:

- Frontend: http://localhost:3000
- GraphQL server: http://localhost:4000/graphql

## Development

### Project Structure

```
earthquake-tracker/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── db/           # Database configuration and schema
│   │   │   ├── graphql/      # GraphQL schema and resolvers
│   │   │   └── scripts/      # Database seeding scripts
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── app/          # Next.js app directory
│       │   ├── components/   # React components
│       │   ├── graphql/      # GraphQL operations
│       │   └── lib/          # Utility functions
│       └── package.json
└── package.json
```

### Available Scripts

From the root directory:

```bash
pnpm dev      # Start both frontend and backend in development mode
pnpm build    # Build both packages
pnpm lint     # Run linting for all packages
```

Backend-specific commands (in packages/backend):

```bash
pnpm dev          # Start development server
pnpm db:generate  # Generate database migrations
pnpm db:push      # Apply migrations
pnpm db:seed      # Seed the database
pnpm build        # Build for production
pnpm lint         # Run linting
pnpm format       # Format code with Prettier
```

Frontend-specific commands (in packages/frontend):

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run linting
```

## Features

- View a list of earthquakes with location, magnitude, and date information
- Add new earthquake records
- Update existing earthquake data
- Delete earthquake records
- Form validation and error handling
- Clean and responsive UI using Tailwind CSS
- Real-time updates with Apollo Client cache management

## API Documentation

The GraphQL API provides the following operations:

### Queries

- `earthquakes`: Fetch all earthquakes
- `earthquake(id: Int!)`: Fetch a specific earthquake by ID

### Mutations

- `createEarthquake(input: CreateEarthquakeInput!)`: Add a new earthquake
- `updateEarthquake(id: Int!, input: UpdateEarthquakeInput!)`: Update an existing earthquake
- `deleteEarthquake(id: Int!)`: Delete an earthquake

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
