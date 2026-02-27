import nebulaBg from '@/assets/nebula-bg.jpg'
import logo from '@/components/chatbot UI/assets/logo.svg'
import { extractVideoId } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { lazy, Suspense, useState } from 'react'
import StarField from './StarField'

const Globe = lazy(() => import('./Globe'))

export default function Hero() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const videoId = extractVideoId(url)
    if (!videoId) {
      setError('Invalid YouTube URL')
      return
    }
    navigate({ to: '/video/$videoId', params: { videoId } })
  }
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Nebula background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${nebulaBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
        }}
      />
      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'var(--gradient-hero)' }}
      />

      <StarField count={120} />

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-[90%] max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-xl font-bold text-gradient-cosmic tracking-widest flex items-center gap-3"
        >
          <img src={logo} alt="Summara Logo" className="w-8 h-8" />
          SUMMARA
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-6 font-body text-sm"
        >
          {['Features', 'How It Works', 'Pricing', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-white/70 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {item}
            </a>
          ))}
          <button className="bg-primary/80 hover:bg-primary transition-colors text-white px-5 py-2 rounded-full text-xs font-medium shadow-[0_0_15px_rgba(255,94,0,0.3)]">
            Get Started
          </button>
        </motion.div>
      </nav>

      {/* Globe */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="w-full max-w-2xl h-[500px] md:h-[700px]"
        >
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-primary animate-pulse-glow" />
              </div>
            }
          >
            <Globe />
          </Suspense>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 mt-80 md:mt-112">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <p className="font-display text-xs tracking-[0.4em] text-primary mb-4 uppercase">
            AI-Powered Intelligence
          </p>
          <h1
            className="glitch font-display text-3xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-2"
            data-text="Unlock the World's Knowledge"
          >
            Chat with any video.
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mt-12">
              {error && (
                <div className="absolute top-full left-0 mt-2 text-red-500 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}
              <div className="relative w-full max-w-2xl rounded-full p-[2px] overflow-hidden shadow-[0_0_30px_rgba(255,94,0,0.15)] group">
                {/* Spinning orange/magenta gradient background */}
                <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] opacity-80 bg-[conic-gradient(from_0deg,#FF5E00_0%,#FF5E00_45%,#F29B88_65%,#D9169D_85%,#FF5E00_100%)]" />

                {/* Inner input container to cover the middle */}
                <div className="relative w-full h-full bg-[#020810]/95 backdrop-blur-2xl rounded-full flex items-center overflow-hidden">
                  <input
                    type="text"
                    placeholder="Paste Youtube URL here..."
                    className="w-full bg-transparent pl-8 pr-16 py-5 text-base md:text-lg text-white placeholder:text-white/40 focus:outline-none transition-all"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setError('')
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!url}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-white rounded-full p-3 md:p-3.5 transition-colors shadow-[0_0_15px_rgba(255,94,0,0.3)] flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
