import { MessageCircle, Minus, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { productById } from '../../data/products'
import { money } from '../../lib/format'
import { waLink } from '../../lib/whatsapp'
import { useCart } from '../../store/cart'
import { useT, useUI } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { Overlay } from '../ui/Overlay'
import { Photo } from '../ui/Photo'

export function QuickView() {
  const { t, lang } = useT()
  const { quickView, setQuickView, setCartOpen } = useUI()
  const add = useCart((s) => s.add)
  const p = quickView ? productById(quickView) : undefined
  const [variant, setVariant] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (p) {
      setVariant(p.variants[0].id)
      setQty(1)
    }
  }, [p])

  const close = () => setQuickView(null)
  const v = p?.variants.find((x) => x.id === variant) ?? p?.variants[0]

  return (
    <Overlay open={!!p} onClose={close} label={p?.name[lang] ?? ''}>
      {p && v && (
        <div className="grid md:grid-cols-2">
          <button onClick={close} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-bg/70 backdrop-blur" aria-label={t.ui.close}>
            <X size={18} />
          </button>
          <div className="relative aspect-square bg-[radial-gradient(circle_at_50%_45%,rgb(var(--raised)),rgb(var(--surface)))] md:aspect-auto">
            <Photo src={p.image} alt={p.name[lang]} className="absolute inset-0" fallback={<CutArt shape={p.shape} bms={p.bms} seed={p.id} className="absolute inset-0 h-full w-full p-10" />} />
            <span className="absolute bottom-5 left-5 chip text-gold">BMS {p.bms} / 12</span>
          </div>
          <div className="flex flex-col p-7 md:p-10">
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">{p.local}</p>
            <h3 className="h-display mt-2 text-5xl">{p.name[lang]}</h3>
            <p className="mt-4 leading-relaxed text-ink/70">{p.desc[lang]}</p>
            <dl className="mt-6 divide-y divide-[rgb(var(--line)/0.1)] border-y hairline text-sm">
              {[
                [t.shop.origin, p.origin[lang]],
                [t.shop.doneness, p.doneness[lang]],
                [t.shop.pairing, p.pairing[lang]],
              ].map(([k, val]) => (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right">{val}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {p.variants.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setVariant(x.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold ${x.id === variant ? 'border-gold bg-gold/10 text-gold' : 'hairline text-ink/70'}`}
                >
                  {x.label} · {money(x.price)}
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-full border hairline">
                <button className="grid h-11 w-11 place-items-center" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center tabular-nums">{qty}</span>
                <button className="grid h-11 w-11 place-items-center" onClick={() => setQty((q) => q + 1)} aria-label="+">
                  <Plus size={14} />
                </button>
              </div>
              <button
                className="btn-gold flex-1"
                onClick={() => {
                  add(p.id, v.id, qty)
                  close()
                  setCartOpen(true)
                }}
              >
                {t.shop.add} · {money(v.price * qty)}
              </button>
            </div>
            <a href={waLink(`${t.wa.hello}\n${t.wa.product} ${p.name[lang]} (${v.label})`)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:text-gold">
              <MessageCircle size={14} /> {t.shop.askWhats}
            </a>
          </div>
        </div>
      )}
    </Overlay>
  )
}
