import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// ============================================================================
// CLIENT ROUTER
// ============================================================================

export const clientRouter = router({
  getAll: protectedProcedure
    .input(
      z
        .object({
          searchText: z.string().optional(),
          clientIds: z.array(z.string()).optional(),
          lastModifiedDate: z.string().optional(),
          isProspect: z.boolean().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClients(input);
    }),

  getById: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClientById(input.clientId);
    }),

  search: protectedProcedure
    .input(z.object({ searchText: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClients({ searchText: input.searchText });
    }),

  add: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional(),
        mobilePhone: z.string().optional(),
        birthDate: z.string().optional(),
        addressLine1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        emergencyContactRelationship: z.string().optional(),
        sendAccountEmails: z.boolean().optional(),
        referredBy: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.addClient(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        mobilePhone: z.string().optional(),
        birthDate: z.string().optional(),
        addressLine1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        sendAccountEmails: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.updateClient(input);
    }),

  getVisits: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClientVisits(input);
    }),

  getMemberships: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        locationId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClientMemberships(input.clientId, input.locationId);
    }),

  getContracts: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClientContracts(input.clientId);
    }),

  getAccountBalances: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getClientAccountBalances(input.clientId);
    }),

  checkIn: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        locationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.addClientArrival(input.clientId, input.locationId);
    }),
});
