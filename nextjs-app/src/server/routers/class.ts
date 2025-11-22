import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// ============================================================================
// CLASS ROUTER
// ============================================================================

export const classRouter = router({
  getAll: protectedProcedure
    .input(
      z
        .object({
          classDescriptionIds: z.array(z.number()).optional(),
          classIds: z.array(z.number()).optional(),
          staffIds: z.array(z.number()).optional(),
          startDateTime: z.string().optional(),
          endDateTime: z.string().optional(),
          locationIds: z.array(z.number()).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClasses(input);
    }),

  getById: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClassById(input.classId);
    }),

  getDescriptions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.mindbody.getClassDescriptions();
  }),

  getSchedules: protectedProcedure
    .input(
      z
        .object({
          locationIds: z.array(z.number()).optional(),
          classDescriptionIds: z.array(z.number()).optional(),
          staffIds: z.array(z.number()).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClassSchedules(input);
    }),

  addClient: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        classId: z.number(),
        requirePayment: z.boolean().optional(),
        waitlist: z.boolean().optional(),
        sendEmail: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.addClientToClass(input);
    }),

  removeClient: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        classId: z.number(),
        lateCancel: z.boolean().optional(),
        sendEmail: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.removeClientFromClass(input);
    }),

  getWaitlist: protectedProcedure
    .input(
      z
        .object({
          classIds: z.array(z.number()).optional(),
          clientIds: z.array(z.string()).optional(),
          hidePastEntries: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getWaitlistEntries(
        input?.classIds,
        input?.clientIds,
        input?.hidePastEntries
      );
    }),

  substituteTeacher: protectedProcedure
    .input(
      z.object({
        classId: z.number(),
        staffId: z.number(),
        sendClientEmail: z.boolean().optional(),
        sendOriginalTeacherEmail: z.boolean().optional(),
        sendSubstituteTeacherEmail: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.substituteClassTeacher(input);
    }),
});
