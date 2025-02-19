import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';

import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';

async function startServer(): Promise<void> {
  const app = express();
  const port = process.env.PORT || 4000;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server));

  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  });
}

startServer().catch(console.error);
