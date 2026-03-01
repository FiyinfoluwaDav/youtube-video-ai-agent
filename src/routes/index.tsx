import FeaturesSection from '@/components/Landing Page UI/components/FeaturesSection'
import Footer from '@/components/Landing Page UI/components/Footer'
import Hero from '@/components/Landing Page UI/components/Hero'
import HowItWorks from '@/components/Landing Page UI/components/HowItWorks'
import { createFileRoute } from '@tanstack/react-router'
import '../../index.css'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="landing-page-theme min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <main className="min-h-screen bg-background overflow-x-hidden w-full">
        <Hero />
        <FeaturesSection />
        <HowItWorks />
        <Footer />
      </main>
    </div>
  )
}
