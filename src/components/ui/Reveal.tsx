import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/** Masked line-by-line headline reveal (Framer Motion). */
export function RevealLines({ lines, className, delay = 0 }: { lines: ReactNode[]; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: '110%', rotate: 2 }}
            whileInView={{ y: '0%', rotate: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

const fade: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: d } }),
}

export function FadeUp({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} variants={fade} custom={delay} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8% 0px' }}>
      {children}
    </motion.div>
  )
}
