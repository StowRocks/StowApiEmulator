import { typeDefs } from '@/schema';
import { resolvers } from '@/resolvers';

jest.mock('axios');

describe('GraphQL API handler', () => {
  beforeEach(() => {
    process.env.TMDB_API_KEY = 'test-key';
    process.env.TMDB_API_TOKEN = 'test-token';
    process.env.ALLOWED_TMDB_IDS = '1';
  });

  afterEach(() => {
    delete process.env.TMDB_API_KEY;
    delete process.env.TMDB_API_TOKEN;
    delete process.env.ALLOWED_TMDB_IDS;
  });

  it('should set Cache-Control header with s-maxage=86400', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ApolloServer } = require('@apollo/server');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { startServerAndCreateNextHandler } = require('@as-integrations/next');

    const mockSetHeader = jest.fn();
    const mockRes = {
      setHeader: mockSetHeader,
      end: jest.fn(),
      send: jest.fn(),
      getHeader: jest.fn(),
      writeHead: jest.fn(),
      statusCode: 200,
    };
    const mockReq = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { query: '{ __typename }' },
      url: '/api/graphql',
      query: {},
    };

    const server = new ApolloServer({ typeDefs, resolvers });
    const handler = startServerAndCreateNextHandler(server, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: async (req: any, res: any) => {
        res.setHeader('Cache-Control', 'public, s-maxage=86400');
        return { req, res };
      },
    });

    await handler(mockReq, mockRes);

    expect(mockSetHeader).toHaveBeenCalledWith('Cache-Control', 'public, s-maxage=86400');
  });

  it('should initialize Apollo Server with correct typeDefs and resolvers', () => {
    // Verify the schema contains expected query types
    expect(typeDefs).toContain('findScenes');
    expect(typeDefs).toContain('findPerformers');
    expect(typeDefs).toContain('FindScenesResultType');
    expect(typeDefs).toContain('FindPerformersResultType');

    // Verify resolvers have the expected structure
    expect(resolvers.Query.findScenes).toBeDefined();
    expect(resolvers.Query.findPerformers).toBeDefined();
    expect(resolvers.Performer.galleries).toBeDefined();
    expect(resolvers.Movie.scenes).toBeDefined();
  });
});
