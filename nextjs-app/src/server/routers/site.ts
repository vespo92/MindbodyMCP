import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// ============================================================================
// SITE & LOCATION ROUTER
// ============================================================================

export const siteRouter = router({
  getSites: protectedProcedure.query(async ({ ctx }) => {
    return ctx.mindbody.getSites();
  }),

  getLocations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.mindbody.getLocations();
  }),

  getResources: protectedProcedure.query(async ({ ctx }) => {
    return ctx.mindbody.getResources();
  }),

  getActivationCode: protectedProcedure.query(async ({ ctx }) => {
    return ctx.mindbody.getActivationCode();
  }),

  getPrograms: protectedProcedure
    .input(
      z
        .object({
          scheduleType: z.enum(['All', 'Class', 'Enrollment', 'Appointment']).optional(),
          onlineOnly: z.boolean().optional(),
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getPrograms(input);
    }),

  getSessionTypes: protectedProcedure
    .input(
      z
        .object({
          programIds: z.array(z.number()).optional(),
          onlineOnly: z.boolean().optional(),
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getSessionTypes(input);
    }),
});
