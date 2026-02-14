import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import type { NextApiRequest } from 'next';
import { typeDefs } from '../../src/schema';
import { resolvers } from '../../src/resolvers';
import { validateApiKey } from '../../src/auth';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

export default startServerAndCreateNextHandler<NextApiRequest>(server, {
  context: async (req, res) => {
    // Check API key
    const apiKey = req.headers['apikey'] as string | undefined;
    if (!apiKey || !validateApiKey(apiKey)) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid or missing API key' }));
      throw new Error('Unauthorized');
    }

    res.setHeader('Cache-Control', 'public, s-maxage=86400');
    return { req, res };
  },
});
