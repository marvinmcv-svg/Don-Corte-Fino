import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useT } from '../../store/ui'

export function Testimonials() {
  const { t } = useT()
  const [i, setI] = useState(0)
  const items = t.testimonials.items
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 6000)
    return () => clearInterval(id)
  }, [items.length])

  return (
    <section className="relative border-y hairline py-28 md:py-36">
      <div className="mx-auto max-w-5xl px-4 text-center md:px-10">
        <p className="eyebrow">{t.testimonials.eyebrow}</p>
        <div className="relative mt-10 min-h-[260px] md:min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.figure key={`${i}-${items[i].q}`} initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <blockquote className="h-display text-4xl italic md:text-6xl">“{items[i].q}”</blockquote>
              <figcaption className="mt-8 text-[0.68rem] uppercase tracking-luxe text-muted">{items[i].a}</figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, j) => (
            <button key={j} onClick={() => setI(j)} aria-label={`${j + 1}`} className={`h-1 rounded-full transition-all duration-500 ${j === i ? 'w-10 bg-gold' : 'w-4 bg-ink/20'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
