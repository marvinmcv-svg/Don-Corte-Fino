import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../../data/products'
import { money } from '../../lib/format'
import { useCart } from '../../store/cart'
import { useT, useUI } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { Photo } from '../ui/Photo'

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { t, lang } = useT()
  const add = useCart((s) => s.add)
  const setQuickView = useUI((s) => s.setQuickView)
  const [variant, setVariant] = useState(p.variants[0].id)
  const [justAdded, setJustAdded] = useState(false)
  const v = p.variants.find((x) => x.id === variant)!

  const onAdd = () => {
    add(p.id, variant)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border hairline bg-surface"
    >
      <button onClick={() => setQuickView(p.id)} className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgb(var(--raised)),rgb(var(--surface)))]" aria-label={`${t.shop.details}: ${p.name[lang]}`}>
        <Photo
          src={p.image}
          alt={p.name[lang]}
          className="absolute inset-0 transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.06]"
          fallback={<CutArt shape={p.shape} bms={p.bms} seed={p.id} className="absolute inset-0 h-full w-full p-6" />}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {p.badges?.map((b) => (
            <span key={b} className="rounded-full bg-bg/80 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-gold backdrop-blur">
              {t.shop.badges[b]}
            </span>
          ))}
        </div>
        {p.bms > 1 && <span className="absolute right-4 top-4 rounded-full border border-gold/40 px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.14em] text-gold">BMS {p.bms}</span>}
      </button>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">{p.local}</p>
        <h3 className="mt-1 font-display text-[1.7rem] leading-tight">{p.name[lang]}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{p.desc[lang]}</p>

        {p.variants.length > 1 && (
          <div className="mt-4 flex gap-2">
            {p.variants.map((x) => (
              <button
                key={x.id}
                onClick={() => setVariant(x.id)}
                className={`rounded-full border px-3 py-1.5 text-[0.7rem] font-semibold transition-colors ${x.id === variant ? 'border-gold bg-gold/10 text-gold' : 'hairline text-ink/60 hover:text-ink'}`}
              >
                {x.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">{p.variants.length === 1 ? v.label : ''}</div>
            <div className="font-display text-3xl">{money(v.price)}</div>
          </div>
          <button onClick={onAdd} className={`btn h-11 px-5 ${justAdded ? 'bg-ink text-bg' : 'bg-gold text-bg hover:bg-ink'}`}>
            {justAdded ? <Check size={15} /> : <Plus size={15} />}
            {justAdded ? t.shop.added : t.shop.add}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
