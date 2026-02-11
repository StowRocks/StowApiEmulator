import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import type { NextApiRequest } from 'next';
import { typeDefs } from '../../src/schema';
import { resolvers } from '../../src/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

export default startServerAndCreateNextHandler<NextApiRequest>(server, {
  context: async (req, res) => {
    res.setHeader('Cache-Control', 'public, s-maxage=86400');
    return { req, res };
  },
});
