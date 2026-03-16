import { useEffect, useRef } from 'react'

interface StarFieldProps {
  count?: number
}

export default function StarField({ count = 200 }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.1,
      speed: 0.02 + Math.random() * 0.05,
      twinkle: Math.random() * Math.PI * 2,
    }))

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      
      stars.forEach((star) => {
        // Subtle twinkle effect
        const currentOpacity = star.opacity * (0.6 + 0.4 * Math.sin(time / 1000 + star.twinkle))
        
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Drifting effect (optional, very slow)
        star.y -= star.speed
        if (star.y < 0) star.y = height
      })

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
