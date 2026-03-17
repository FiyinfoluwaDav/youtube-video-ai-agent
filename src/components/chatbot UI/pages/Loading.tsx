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
      {/* Vertical Speed Lines */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, opacity: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2,
            }}
            className="absolute bg-linear-to-b from-transparent via-white/20 to-transparent w-px h-20"
            style={{
              left: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-md">
        <div className="relative">
          {/* Thruster Flame effect behind rocket */}
          <motion.div
            animate={{
              scaleY: [1, 1.5, 1],
              scaleX: [1, 0.9, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{ duration: 0.1, repeat: Infinity }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-8 h-24 bg-linear-to-t from-primary via-secondary to-transparent blur-lg rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 0.15, repeat: Infinity }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/30 blur-2xl rounded-full"
          />

          <motion.div
            animate={{
              x: [-0.5, 0.5, -0.5],
              y: [-0.5, 0.5, -0.5],
            }}
            transition={{
              duration: 0.05,
              repeat: Infinity,
              ease: 'linear',
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
              className="h-full bg-linear-to-r from-primary via-secondary to-primary shadow-[0_0_15px_rgba(255,94,0,0.5)]"
              style={{ width: `${progress}%` }}
            />

            {/* Glossy overlay for progress bar */}
            <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
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
