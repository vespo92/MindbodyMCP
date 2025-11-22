import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// ============================================================================
// SALES ROUTER
// ============================================================================

export const salesRouter = router({
  getServices: protectedProcedure
    .input(
      z
        .object({
          programIds: z.array(z.number()).optional(),
          sessionTypeIds: z.array(z.number()).optional(),
          locationId: z.number().optional(),
          classId: z.number().optional(),
          hideRelatedPrograms: z.boolean().optional(),
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getServices(input);
    }),

  getPackages: protectedProcedure
    .input(
      z
        .object({
          locationId: z.number().optional(),
          classScheduleId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getPackages(input?.locationId, input?.classScheduleId);
    }),

  getProducts: protectedProcedure
    .input(
      z
        .object({
          productIds: z.array(z.number()).optional(),
          searchText: z.string().optional(),
          categoryIds: z.array(z.string()).optional(),
          subCategoryIds: z.array(z.string()).optional(),
          sellOnline: z.boolean().optional(),
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getProducts(input);
    }),

  getContracts: protectedProcedure
    .input(
      z
        .object({
          contractIds: z.array(z.number()).optional(),
          soldOnline: z.boolean().optional(),
          locationId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.mindbody.getContracts(input);
    }),

  checkout: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        items: z.array(
          z.object({
            item: z.object({
              type: z.enum(['Service', 'Product', 'Package', 'Tip']),
              metadata: z.object({
                id: z.number().optional(),
                name: z.string().optional(),
                amount: z.number().optional(),
              }),
            }),
            quantity: z.number(),
            appointmentBookingRequests: z
              .array(
                z.object({
                  staffId: z.number(),
                  locationId: z.number(),
                  sessionTypeId: z.number(),
                  startDateTime: z.string(),
                  notes: z.string().optional(),
                })
              )
              .optional(),
          })
        ),
        payments: z.array(
          z.object({
            type: z.enum(['Cash', 'Check', 'CreditCard', 'Comp', 'Custom', 'StoredCard']),
            metadata: z.object({
              amount: z.number(),
              notes: z.string().optional(),
              lastFour: z.string().optional(),
              cardholderName: z.string().optional(),
              billingAddress: z.string().optional(),
              billingCity: z.string().optional(),
              billingState: z.string().optional(),
              billingPostalCode: z.string().optional(),
            }),
          })
        ),
        inStore: z.boolean().optional(),
        promotionCode: z.string().optional(),
        sendEmail: z.boolean().optional(),
        locationId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.checkoutShoppingCart(input);
    }),

  purchaseContract: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        contractId: z.number(),
        startDate: z.string(),
        firstPaymentOccurs: z.enum(['StartDate', 'UponSale', 'BillingDate']).optional(),
        clientSignature: z.string().optional(),
        promotionCode: z.string().optional(),
        locationId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.mindbody.purchaseContract(input);
    }),
});
