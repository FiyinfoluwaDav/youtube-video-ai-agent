import { motion, useInView } from 'framer-motion'
import { FileText, Network, Scissors, Zap } from 'lucide-react'
import { useRef } from 'react'
import StarField from './StarField'
import instantSummaryVideo from '../../../assets/landing_page_videos/Instant_Summary.mp4'

const features = [
  {
    icon: Zap,
    title: 'Instant Summaries',
    description:
      'Paste a YouTube link and get a clear, concise summary of the key points, takeaways, and structure in seconds. Grasp the essence without watching the full video.',
    color: 'hsl(var(--vibrant-orange))',
    colorClass: 'primary',
    delay: 0,
    videoSrc: instantSummaryVideo,
  },
  {
    icon: FileText,
    title: 'Convert Videos to PDF',
    description:
      'Transform any summarized video (including full transcripts, highlights, and notes) into a clean, downloadable PDF. Perfect for offline reading, studying, archiving, or sharing.',
    color: 'hsl(var(--vibrant-orange))',
    colorClass: 'primary',
    delay: 0.15,
  },
  {
    icon: Network,
    title: 'Generate Mind Maps',
    description:
      'Automatically create visual mind maps from video content — see main ideas, branches, connections, and hierarchies at a glance. Boost retention and make complex topics easier to understand and review.',
    color: 'hsl(var(--vibrant-orange))',
    colorClass: 'primary',
    delay: 0.3,
  },
  {
    icon: Scissors,
    title: 'Highlight key timestamps',
    description:
      'Summara automatically identifies and highlights the most important moments in any video, letting you jump straight to the content that matters most.',
    color: 'hsl(var(--vibrant-orange))',
    colorClass: 'primary',
    delay: 0.45,
  },
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" className="relative py-32 overflow-hidden" ref={ref}>
      <StarField count={80} />
      <div className="absolute inset-0 nebula-section" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="font-display text-xs tracking-[0.4em] text-primary mb-4 uppercase">
            Summara: Your Video Intelligence
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Ask. Extract.{' '}
            <span className="text-gradient-cosmic">Understand.</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Long YouTube videos get instantly decoded. Key ideas, transcripts,
            and moments extracted with AI.
          </p>
        </motion.div>

        {/* Walkthrough Layout */}
        <div className="flex flex-col items-center">
          {/* Features as a vertical walkthrough stack */}
          <div className="flex flex-col gap-32 w-full max-w-6xl mx-auto mt-16">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`flex flex-col items-center gap-12 lg:gap-24 pb-16 lg:pb-24 ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                {/* Feature Text Location */}
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 1 ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8 }}
                  className="w-full lg:w-2/5 flex flex-col items-start"
                >
                  <h3
                    className="font-display text-3xl md:text-4xl font-bold mb-6"
                    style={{ color: feature.color }}
                  >
                    {feature.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
                    {feature.description}
                  </p>
                </motion.div>

                {/* Video Placeholder */}
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 1 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="w-full lg:w-3/5 aspect-video rounded-2xl bg-black/40 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500"
                  style={{
                    boxShadow: `0 20px 40px -20px ${feature.color}40, inset 0 0 40px ${feature.color}10`,
                  }}
                >
                  {'videoSrc' in feature && feature.videoSrc ? (
                    <video
                      src={feature.videoSrc as string}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover absolute inset-0 z-0 opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

                      {/* Play Button Placeholder */}
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/10 z-10"
                        style={{ background: `${feature.color}20` }}
                      >
                        <div className="w-0 h-0 border-t-10 border-t-transparent border-l-18 border-l-white border-b-10 border-b-transparent ml-1.5 opacity-90 shadow-2xl" />
                      </div>

                      <p className="mt-6 font-display text-xs tracking-[0.2em] text-white/40 uppercase font-medium z-10">
                        Video Placeholder
                      </p>
                    </>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
