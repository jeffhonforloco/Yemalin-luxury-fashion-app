import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// Get orders
export const getOrders = publicProcedure
  .input(z.object({
    page: z.number().default(1),
    limit: z.number().default(50),
    status: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }))
  .query(async ({ input }) => {
    return {
      orders: [],
      total: 0,
      page: input.page,
      limit: input.limit,
      totalPages: 0,
    };
  });

// Get order statistics
export const getOrderStats = publicProcedure
  .query(async () => {
    return {
      total: 920,
      revenue: 184000,
      averageOrderValue: 200,
      today: 12,
      thisWeek: 84,
      thisMonth: 320,
      byStatus: {
        processing: 45,
        shipped: 320,
        delivered: 520,
        cancelled: 35,
      },
    };
  });

