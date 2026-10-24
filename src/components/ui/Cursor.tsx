import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

/** Soft gold cursor halo that grows over interactive elements (desktop only). */
export function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 })
  const [hover, setHover] = useState(false)
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)

  useEffect(() => {
    if (!enabled) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHover(!!(e.target as HTMLElement).closest('a,button,input,select,textarea,[role=button]'))
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full border border-gold/70 mix-blend-difference"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: hover ? 56 : 14, height: hover ? 56 : 14, backgroundColor: hover ? 'rgba(200,161,101,0.15)' : 'rgba(200,161,101,0.6)' }}
      transition={{ duration: 0.25 }}
    />
  )
}
