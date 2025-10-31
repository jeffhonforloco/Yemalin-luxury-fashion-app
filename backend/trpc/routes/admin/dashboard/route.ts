import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// Dashboard statistics route
export default publicProcedure
  .query(async () => {
    // In production, this would fetch from a database
    // For now, return mock data structure that matches what we'd have
    return {
      emails: {
        total: 3247,
        subscribed: 3100,
        unsubscribed: 147,
        bySource: {
          waitlist: 1500,
          cart: 800,
          checkout: 600,
          popup: 247,
          newsletter: 100,
        },
      },
      carts: {
        abandoned: 1240,
        recovered: 380,
        recoveryRate: 30.6,
        totalValue: 248000,
        averageCartValue: 200,
      },
      orders: {
        total: 920,
        revenue: 184000,
        averageOrderValue: 200,
        today: 12,
        thisWeek: 84,
        thisMonth: 320,
      },
      users: {
        total: 3247,
        vip: 280,
        active: 2100,
        inactive: 867,
      },
      marketing: {
        emailsSent: 5420,
        openRate: 38.5,
        clickRate: 9.2,
        conversionRate: 3.8,
      },
    };
  });

