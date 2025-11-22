import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// ============================================================================
// APPOINTMENT ROUTER
// ============================================================================

export const appointmentRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        staffIds: z.array(z.number()),
        locationIds: z.array(z.number()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        appointmentIds: z.array(z.number()).optional(),
        clientIds: z.array(z.string()).optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getAppointments(input);
    }),

  add: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        staffId: z.number(),
        locationId: z.number(),
        sessionTypeId: z.number(),
        startDateTime: z.string(),
        resourceIds: z.array(z.number()).optional(),
        notes: z.string().optional(),
        staffRequested: z.boolean().optional(),
        executePayment: z.boolean().optional(),
        sendEmail: z.boolean().optional(),
        applyPayment: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.addAppointment(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        staffId: z.number().optional(),
        startDateTime: z.string().optional(),
        endDateTime: z.string().optional(),
        resourceIds: z.array(z.number()).optional(),
        notes: z.string().optional(),
        executePayment: z.boolean().optional(),
        sendEmail: z.boolean().optional(),
        applyPayment: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.updateAppointment(input);
    }),

  getBookableItems: protectedProcedure
    .input(
      z.object({
        sessionTypeIds: z.array(z.number()),
        locationIds: z.array(z.number()).optional(),
        staffIds: z.array(z.number()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        appointmentId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getBookableItems(input);
    }),

  getScheduleItems: protectedProcedure
    .input(
      z
        .object({
          locationIds: z.array(z.number()).optional(),
          staffIds: z.array(z.number()).optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          ignorePrepFinishBuffer: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getScheduleItems(input);
    }),

  getActiveSessionTimes: protectedProcedure
    .input(
      z
        .object({
          scheduleType: z.enum(['All', 'Class', 'Enrollment', 'Appointment']).optional(),
          sessionTypeIds: z.array(z.number()).optional(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          days: z.array(z.string()).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getActiveSessionTimes(input);
    }),
});
