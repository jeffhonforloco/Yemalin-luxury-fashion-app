import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import dashboardRoute from "./routes/admin/dashboard/route";
import * as emailRoutes from "./routes/admin/emails/route";
import * as cartRoutes from "./routes/admin/carts/route";
import * as analyticsRoutes from "./routes/admin/analytics/route";
import * as orderRoutes from "./routes/admin/orders/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  admin: createTRPCRouter({
    dashboard: dashboardRoute,
    emails: createTRPCRouter({
      getAll: emailRoutes.getEmails,
      getStats: emailRoutes.getEmailStats,
      updateSubscription: emailRoutes.updateEmailSubscription,
    }),
    carts: createTRPCRouter({
      getAll: cartRoutes.getAbandonedCarts,
      getStats: cartRoutes.getCartStats,
      markRecovered: cartRoutes.markCartRecovered,
    }),
    analytics: createTRPCRouter({
      getAnalytics: analyticsRoutes.getAnalytics,
      getFunnel: analyticsRoutes.getConversionFunnel,
    }),
    orders: createTRPCRouter({
      getAll: orderRoutes.getOrders,
      getStats: orderRoutes.getOrderStats,
    }),
  }),
});

export type AppRouter = typeof appRouter;