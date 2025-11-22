import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { MindbodyService } from '@/lib/mindbody/service';

// ============================================================================
// TRPC CONTEXT & INITIALIZATION
// ============================================================================

export interface Context {
  prisma: PrismaClient;
  mindbody: MindbodyService;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Middleware to check if Mindbody service is configured
const isMindbodyConfigured = middleware(async ({ ctx, next }) => {
  if (!process.env.MINDBODY_API_KEY || !process.env.MINDBODY_SITE_ID) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Mindbody API credentials are not configured',
    });
  }
  return next({ ctx });
});

export const protectedProcedure = publicProcedure.use(isMindbodyConfigured);
