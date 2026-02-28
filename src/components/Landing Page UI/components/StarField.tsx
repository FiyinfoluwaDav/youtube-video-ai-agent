import { useEffect, useRef } from 'react'

interface StarFieldProps {
  count?: number
}

export default function StarField({ count = 150 }: StarFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const stars = Array.from({ length: count }, (_, i) => {
      const star = document.createElement('div')
      star.className = 'star'
      const size = Math.random() * 2.5 + 0.5
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        --duration: ${2 + Math.random() * 4}s;
        --delay: ${Math.random() * 4}s;
        opacity: ${Math.random() * 0.7 + 0.1};
      `
      return star
    })

    stars.forEach((s) => container.appendChild(s))
    return () => stars.forEach((s) => s.remove())
  }, [count])

  return <div ref={containerRef} className="star-field" />
}
