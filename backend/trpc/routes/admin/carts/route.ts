import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// Get abandoned carts
export const getAbandonedCarts = publicProcedure
  .input(z.object({
    page: z.number().default(1),
    limit: z.number().default(50),
    recovered: z.boolean().optional(),
  }))
  .query(async ({ input }) => {
    return {
      carts: [],
      total: 0,
      page: input.page,
      limit: input.limit,
      totalPages: 0,
    };
  });

// Get cart statistics
export const getCartStats = publicProcedure
  .query(async () => {
    return {
      abandoned: 1240,
      recovered: 380,
      recoveryRate: 30.6,
      totalValue: 248000,
      averageCartValue: 200,
      remindersSent: {
        first: 1240,
        second: 920,
        third: 650,
      },
      recoveryByReminder: {
        first: 180,
        second: 140,
        third: 60,
      },
    };
  });

// Mark cart as recovered (manual)
export const markCartRecovered = publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .mutation(async ({ input }) => {
    return {
      success: true,
      email: input.email,
      recoveredAt: new Date().toISOString(),
    };
  });

