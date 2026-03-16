import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import { useEffect, useState } from 'react'

const Loading = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="landing-page-theme min-h-screen bg-[#020810] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: Math.random(), scale: Math.random() }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-md">
        <div className="relative">
          {/* Flame/Glow effect behind rocket */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-20 bg-gradient-to-t from-primary via-secondary to-transparent blur-xl rounded-full"
          />

          <motion.div
            animate={{
              y: [-10, 10, -10],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-full shadow-[0_0_50px_rgba(255,94,0,0.2)]"
          >
            <Rocket className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-gradient-cosmic tracking-[0.3em] mb-2 uppercase">
              Summara
            </h2>
            <p className="font-body text-white/40 text-sm tracking-wider uppercase">
              Processing...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-primary shadow-[0_0_15px_rgba(255,94,0,0.5)]"
              style={{ width: `${progress}%` }}
            />

            {/* Glossy overlay for progress bar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>

          <div className="font-display text-[10px] text-primary/60 tracking-widest uppercase">
            {progress}% Loaded
          </div>
        </div>
      </div>

      {/* Nebula Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>
    </div>
  )
}

export default Loading
