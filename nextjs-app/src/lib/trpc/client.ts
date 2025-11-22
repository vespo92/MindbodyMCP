import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

// ============================================================================
// TRPC REACT CLIENT
// ============================================================================

export const trpc = createTRPCReact<AppRouter>();
