import { router } from '../trpc';
import { siteRouter } from './site';
import { staffRouter } from './staff';
import { clientRouter } from './client';
import { classRouter } from './class';
import { appointmentRouter } from './appointment';
import { enrollmentRouter } from './enrollment';
import { salesRouter } from './sales';

// ============================================================================
// MAIN APP ROUTER - Combines all sub-routers
// ============================================================================

export const appRouter = router({
  site: siteRouter,
  staff: staffRouter,
  client: clientRouter,
  class: classRouter,
  appointment: appointmentRouter,
  enrollment: enrollmentRouter,
  sales: salesRouter,
});

export type AppRouter = typeof appRouter;
