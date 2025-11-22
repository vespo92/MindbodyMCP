import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { prisma } from '@/lib/db';
import { MindbodyService } from '@/lib/mindbody/service';

// ============================================================================
// TRPC API ROUTE HANDLER
// ============================================================================

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({
      prisma,
      mindbody: new MindbodyService(),
    }),
    onError: ({ path, error }) => {
      console.error(`tRPC Error on '${path}':`, error.message);
    },
  });

export { handler as GET, handler as POST };
