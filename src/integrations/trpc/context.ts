import { verifyToken } from '@clerk/backend'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export interface Context {
  userId: string | null
}

export const createContext = async (
  opts: FetchCreateContextFnOptions,
): Promise<Context> => {
  const authHeader = opts.req.headers.get('authorization')
  const token = authHeader?.split(' ')[1]

  let userId: string | null = null

  if (token) {
    try {
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      })
      userId = verified.sub
    } catch (error) {
      console.error('Failed to verify token', error)
      // Fallback for dev if token is invalid but we want to proceed (optional, but let's stick to explicit mock below)
    }
  } else if (process.env.NODE_ENV === 'development') {
    // Mock user for development if no token is present
    console.log('Using mock user for development')
    userId = 'user_2tN7Xk7Xk7Xk7Xk7Xk7Xk7Xk7Xk' // Example Clerk ID format
  }

  return {
    userId,
  }
}
