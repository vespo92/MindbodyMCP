import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// ============================================================================
// STAFF ROUTER
// ============================================================================

export const staffRouter = router({
  getAll: protectedProcedure
    .input(
      z
        .object({
          staffIds: z.array(z.number()).optional(),
          filters: z.array(z.string()).optional(),
          sessionTypeIds: z.array(z.number()).optional(),
          locationIds: z.array(z.number()).optional(),
          startDateTime: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getStaff(input);
    }),

  getById: protectedProcedure
    .input(z.object({ staffId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getStaffById(input.staffId);
    }),

  getSchedule: protectedProcedure
    .input(
      z.object({
        teacherId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getTeacherSchedule(
        input.teacherId,
        input.startDate,
        input.endDate
      );
    }),
});
