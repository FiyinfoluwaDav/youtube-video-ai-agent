import type { TRPCRouter } from '@/integrations/trpc/router'
import { createTRPCContext } from '@trpc/tanstack-react-query'

const trpcContext = createTRPCContext<TRPCRouter>()

export const { TRPCProvider, useTRPC, useTRPCClient } = trpcContext
export const trpc = trpcContext
