import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import StarField from './StarField'

const testimonials = [
  {
    name: 'Zara Ahmed',
    role: 'Research Scientist, MIT',
    quote:
      "Summara compressed 400 pages of literature into a 2-minute cosmic brief. It's like having a supermind assistant.",
    size: 180,
    color: 'hsl(195 100% 50%)',
    delay: 0,
    floatDuration: 5,
    x: '5%',
    y: '10%',
  },
  {
    name: 'Marcus Chen',
    role: 'CEO, NeuralTech',
    quote:
      'I process 50 investor reports weekly. Summara distills them in minutes. Absolute game-changer.',
    size: 200,
    color: 'hsl(265 85% 55%)',
    delay: 1.5,
    floatDuration: 7,
    x: '55%',
    y: '5%',
  },
  {
    name: 'Lucia Ferrara',
    role: 'Journalist, The Global Times',
    quote:
      'Breaking news across 20 sources, summarized before my coffee cools. Summara is pure magic.',
    size: 165,
    color: 'hsl(315 90% 65%)',
    delay: 0.8,
    floatDuration: 6,
    x: '75%',
    y: '50%',
  },
  {
    name: 'Raj Patel',
    role: 'PhD Student, Oxford',
    quote:
      'My thesis research went from months to weeks. Summara is the scholarly wormhole I needed.',
    size: 155,
    color: 'hsl(195 100% 50%)',
    delay: 2,
    floatDuration: 8,
    x: '20%',
    y: '55%',
  },
]

function PulsarStar() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {/* Core */}
      <div
        className="w-6 h-6 rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, white, hsl(195 100% 50%))',
        }}
      />
      {/* Pulse rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary"
          style={{
            width: i * 40,
            height: i * 40,
            animation: `pulse-glow ${2 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.3 / i,
          }}
        />
      ))}
    </div>
  )
}

function MeteorShower() {
  const [meteors, setMeteors] = useState<any[]>([])

  useEffect(() => {
    setMeteors(
      Array.from({ length: 8 }, () => ({
        height: `${40 + Math.random() * 80}px`,
        top: `${Math.random() * 60}%`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${6 + Math.random() * 6}s`,
        animationDelay: `${Math.random() * 8}s`,
      })),
    )
  }, [])

  if (meteors.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {meteors.map((m, i) => (
        <div
          key={i}
          className="absolute w-0.5 rounded-full"
          style={{
            height: m.height,
            background: `linear-gradient(to bottom, transparent, hsl(195 100% 50% / 0.8))`,
            top: m.top,
            left: m.left,
            animation: `meteor ${m.animationDuration} linear infinite`,
            animationDelay: m.animationDelay,
            transform: 'rotate(35deg)',
          }}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <section
      id="testimonials"
      className="relative py-32 overflow-hidden min-h-screen"
      ref={ref}
    >
      <StarField count={100} />
      <MeteorShower />
      <div className="absolute inset-0 nebula-section" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-display text-xs tracking-[0.4em] text-cosmic-pink mb-4 uppercase">
            Crazy Cosmic Reviews
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Voices from <span className="text-gradient-cosmic">the Cosmos</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Explorers who dove into Summara's knowledge singularity and never
            looked back.
          </p>
        </motion.div>

        {/* Bubbles floating layout */}
        <div className="relative h-[600px]">
          <PulsarStar />

          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: t.delay * 0.3,
                type: 'spring',
              }}
              className="absolute"
              style={{ left: t.x, top: t.y }}
              onHoverStart={() => setHoveredIdx(i)}
              onHoverEnd={() => setHoveredIdx(null)}
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  duration: t.floatDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: t.delay * 0.2,
                }}
              >
                <div
                  className="bubble-testimonial relative p-6 text-center transition-all duration-500"
                  style={{
                    width: hoveredIdx === i ? t.size * 1.4 : t.size,
                    height: hoveredIdx === i ? 'auto' : t.size,
                    minHeight: hoveredIdx === i ? t.size : undefined,
                    borderRadius: hoveredIdx === i ? '1.5rem' : '50%',
                    borderColor: `${t.color}50`,
                    boxShadow:
                      hoveredIdx === i ? `0 0 30px ${t.color}40` : 'none',
                  }}
                >
                  {hoveredIdx === i ? (
                    <div className="text-left">
                      <p className="font-body text-foreground text-sm leading-relaxed mb-4 italic">
                        "{t.quote}"
                      </p>
                      <div>
                        <p
                          className="font-display text-xs font-bold"
                          style={{ color: t.color }}
                        >
                          {t.name}
                        </p>
                        <p className="font-body text-muted-foreground text-xs">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        className="font-display text-2xl mb-1"
                        style={{ color: t.color }}
                      >
                        ★★★★★
                      </div>
                      <p
                        className="font-display text-xs font-bold text-foreground"
                        style={{ color: t.color }}
                      >
                        {t.name.split(' ')[0]}
                      </p>
                      <p className="font-body text-muted-foreground text-xs mt-1 leading-tight hidden md:block">
                        {t.role.split(',')[0]}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto text-center"
        >
          {[
            { value: '2M+', label: 'Summaries Generated' },
            { value: '95+', label: 'Languages Supported' },
            { value: '4.9★', label: 'Average Rating' },
          ].map((stat) => (
            <div key={stat.label} className="card-cosmic rounded-2xl p-6">
              <div className="font-display text-2xl font-bold text-gradient-cosmic">
                {stat.value}
              </div>
              <div className="font-body text-muted-foreground text-xs mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
