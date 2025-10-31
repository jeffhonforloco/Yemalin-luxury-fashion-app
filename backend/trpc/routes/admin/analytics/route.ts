import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// Get analytics overview
export const getAnalytics = publicProcedure
  .input(z.object({
    dateRange: z.enum(['today', 'week', 'month', 'year']).default('month'),
  }))
  .query(async ({ input }) => {
    return {
      conversions: {
        homepageToShop: 45.2,
        shopToCart: 32.1,
        cartToCheckout: 28.5,
        checkoutToOrder: 92.3,
        overall: 3.8,
      },
      marketing: {
        emailsSent: 5420,
        emailsOpened: 2087,
        emailsClicked: 499,
        emailOpenRate: 38.5,
        emailClickRate: 9.2,
        emailConversionRate: 3.8,
      },
      revenue: {
        total: 184000,
        fromCartRecovery: 46000,
        recoveryPercentage: 25.0,
        averageOrderValue: 200,
      },
      traffic: {
        visitors: 12500,
        sessions: 18200,
        pageViews: 45600,
        averageSessionDuration: 245,
        bounceRate: 32.1,
      },
    };
  });

// Get conversion funnel data
export const getConversionFunnel = publicProcedure
  .query(async () => {
    return {
      steps: [
        { name: 'Homepage Views', count: 12500, percentage: 100 },
        { name: 'Shop Visits', count: 5650, percentage: 45.2 },
        { name: 'Add to Cart', count: 1813, percentage: 32.1 },
        { name: 'Checkout Started', count: 517, percentage: 28.5 },
        { name: 'Order Completed', count: 477, percentage: 92.3 },
      ],
      dropOff: [
        { from: 'Homepage', to: 'Shop', lost: 6850, percentage: 54.8 },
        { from: 'Shop', to: 'Cart', lost: 3837, percentage: 67.9 },
        { from: 'Cart', to: 'Checkout', lost: 1296, percentage: 71.5 },
        { from: 'Checkout', to: 'Order', lost: 40, percentage: 7.7 },
      ],
    };
  });

