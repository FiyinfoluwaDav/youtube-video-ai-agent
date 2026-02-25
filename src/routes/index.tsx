import FeaturesSection from '@/components/Landing Page UI/components/FeaturesSection'
import Footer from '@/components/Landing Page UI/components/Footer'
import Hero from '@/components/Landing Page UI/components/Hero'
import HowItWorks from '@/components/Landing Page UI/components/HowItWorks'
import Pricing from '@/components/Landing Page UI/components/Pricing'
import { useClerk, useUser } from '@clerk/clerk-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import '../../index.css'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { isSignedIn, isLoaded } = useUser()

  return (
    <div className="landing-page-theme min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 flex gap-4 z-20">
        {isLoaded && isSignedIn ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Sign Out
          </button>
        ) : isLoaded && !isSignedIn ? (
          <>
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign up
            </a>
          </>
        ) : (
          // Loading state (invisible or skeleton)
          <div className="w-20 h-8"></div>
        )}
      </div>
      <main className="min-h-screen bg-background overflow-x-hidden w-full">
        <Hero />
        <FeaturesSection />
        <HowItWorks />

        <Pricing />
        <Footer />
      </main>
    </div>
  )
}
