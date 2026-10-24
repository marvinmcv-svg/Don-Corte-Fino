import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { CATEGORIES, PRODUCTS, type Category } from '../../data/products'
import { useT } from '../../store/ui'
import { FadeUp, RevealLines } from '../ui/Reveal'
import { ProductCard } from './ProductCard'

export function Shop() {
  const { t, lang } = useT()
  const [cat, setCat] = useState<Category | 'all'>('all')
  const items = cat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat)

  return (
    <section id="shop" className="relative mx-auto max-w-[1500px] px-4 py-28 md:px-10 md:py-40">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{t.shop.eyebrow}</p>
          <h2 className="h-display mt-4 text-6xl md:text-8xl">
            <RevealLines lines={[t.shop.title]} />
          </h2>
          <FadeUp>
            <p className="mt-5 max-w-md text-ink/65">{t.shop.body}</p>
          </FadeUp>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors ${cat === c.id ? 'text-bg' : 'text-ink/70 hover:text-ink'}`}
            >
              {cat === c.id && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
              <span className="relative">{c.label[lang]}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-7">
        <AnimatePresence mode="popLayout">
          {items.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
      {items.length === 0 && <p className="mt-10 text-muted">{t.shop.empty}</p>}
    </section>
  )
}
