import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import StarField from './StarField'
import instantSummaryVideo from '../../../assets/landing_page_videos/Instant_Summary.mp4'
import video2pdfVideo from '../../../assets/landing_page_videos/Video2pdf_demo.mp4'
import mindmapVideo from '../../../assets/landing_page_videos/Mindmap_vid.mp4'
import timestampVideo from '../../../assets/landing_page_videos/Timestamp_vid.mp4'

const processVideos = [
  instantSummaryVideo,
  video2pdfVideo,
  mindmapVideo,
  timestampVideo,
]

const steps = [
  {
    title: 'Paste YouTube Link',
    description:
      'Simply copy and paste the YouTube video URL into Summara. No downloads required.',
  },
  {
    title: 'AI Analysis',
    description:
      "AI analyzes the video's content, identifying key themes, arguments, and insights.",
  },
  {
    title: 'View Transcript',
    description:
      'Receive a clear, structured summary with bullet points or paragraphs, plus a readable transcript.',
  },
  {
    title: 'Share & Export',
    description:
      'Export PDF summaries and mindmaps, or share via direct link. Download transcripts as PDF.',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [explodedStep, setExplodedStep] = useState<number | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % processVideos.length)
  }

  const handleStepClick = (idx: number) => {
    setExplodedStep(idx)
    setTimeout(() => setExplodedStep(null), 800)
  }

  return (
    <section
      id="how-it-works"
      className="relative py-32 overflow-hidden"
      ref={ref}
    >
      <StarField count={60} />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 60%, hsl(195 100% 10% / 0.2), transparent 60%)',
        }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            How <span className="text-gradient-cosmic">Summara</span> works
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            Summara transforms lengthy YouTube videos into quick, actionable
            insights with AI-powered summaries, synced transcripts, and smart
            navigation.
          </p>
        </motion.div>

        {/* Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2 }}
          className="w-full max-w-5xl mx-auto aspect-video rounded-2xl bg-black/40 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 mb-20"
          style={{
            boxShadow: `0 20px 40px -20px rgba(255,255,255,0.1), inset 0 0 40px rgba(255,255,255,0.05)`,
          }}
        >
          <video
            src={processVideos[currentVideoIndex]}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover absolute inset-0 z-0 opacity-90 transition-opacity duration-500 group-hover:opacity-100"
          />
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div
            className="hidden lg:block absolute top-12 left-1/8 right-1/8 h-px"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--vibrant-orange) / 0.3), hsl(var(--magenta) / 0.3), hsl(var(--light-peach) / 0.3), hsl(var(--vibrant-orange) / 0.3))',
              top: '3rem',
              left: '12.5%',
              right: '12.5%',
              position: 'absolute',
            }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 + 0.4 }}
              onClick={() => handleStepClick(i)}
              className="relative cursor-pointer group"
            >
              {/* Supernova explosion on click */}
              {explodedStep === i && (
                <div
                  className="absolute inset-0 rounded-full border-2 animate-supernova pointer-events-none"
                  style={{
                    borderColor: 'hsl(var(--vibrant-orange))',
                    zIndex: 20,
                  }}
                />
              )}

              <div
                className="card-cosmic rounded-2xl p-8 text-center transition-all duration-300 group-hover:scale-105"
                style={{
                  boxShadow: `0 0 0 1px hsl(var(--vibrant-orange) / 0.2)`,
                }}
              >
                <h3
                  className="font-display text-xl font-bold mb-3 tracking-wide"
                  style={{ color: 'hsl(var(--vibrant-orange))' }}
                >
                  {step.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
