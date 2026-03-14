import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export default function AppClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-bold mb-4">
            Clerk publishable key missing
          </h1>
          <p className="mb-4">
            The app could not initialize Clerk because{' '}
            <code>VITE_CLERK_PUBLISHABLE_KEY</code> is not set.
          </p>
          <p className="text-sm text-slate-300">
            In local development, add it to <code>.env.local</code>. In Vercel,
            add it as an environment variable.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}
