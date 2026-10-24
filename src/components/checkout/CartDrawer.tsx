import { motion } from 'framer-motion'
import { MessageCircle, Minus, Plus, Trash2, X } from 'lucide-react'
import { SITE } from '../../config/site'
import { PRODUCTS, UPSELL_IDS } from '../../data/products'
import { money } from '../../lib/format'
import { scrollToId } from '../../lib/motion'
import { cartText, openWhatsApp } from '../../lib/whatsapp'
import { useCart, useCartSummary } from '../../store/cart'
import { useT, useUI } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { Overlay } from '../ui/Overlay'

export function CartDrawer() {
  const { t, lang } = useT()
  const { cartOpen, setCartOpen, setCheckoutOpen } = useUI()
  const { setQty, remove, add } = useCart()
  const { lines, subtotal } = useCartSummary()
  const remaining = Math.max(0, SITE.freeDeliveryFrom - subtotal)
  const progress = Math.min(1, subtotal / SITE.freeDeliveryFrom)
  const upsell = PRODUCTS.filter((p) => UPSELL_IDS.includes(p.id) && !lines.some((l) => l.productId === p.id)).slice(0, 2)
  const close = () => setCartOpen(false)

  return (
    <Overlay open={cartOpen} onClose={close} variant="drawer" label={t.cart.title}>
      <div className="flex items-center justify-between border-b hairline px-6 py-5">
        <h2 className="font-display text-3xl">{t.cart.title}</h2>
        <button onClick={close} aria-label={t.ui.close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5">
          <X size={18} />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <CutArt shape="ribeye" bms={8} seed="empty" className="w-48 opacity-60" />
          <p className="font-display text-2xl text-ink/70">{t.cart.empty}</p>
          <button
            className="btn-gold"
            onClick={() => {
              close()
              setTimeout(() => scrollToId('shop'), 350)
            }}
          >
            {t.cart.emptyCta}
          </button>
        </div>
      ) : (
        <>
          <div className="border-b hairline px-6 py-4">
            <p className="text-xs text-ink/70">{remaining > 0 ? t.cart.freeIn.replace('{x}', money(remaining)) : t.cart.freeOk}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full bg-gold" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>

          <ul className="flex-1 divide-y divide-[rgb(var(--line)/0.08)] overflow-y-auto px-6">
            {lines.map((l) => {
              const p = PRODUCTS.find((x) => x.id === l.productId)!
              return (
                <motion.li layout key={`${l.productId}-${l.variantId}`} className="flex gap-4 py-5">
                  <div className="h-20 w-24 shrink-0 rounded-xl bg-surface">
                    <CutArt shape={p.shape} bms={p.bms} seed={p.id} className="h-full w-full p-1.5" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-display text-xl leading-tight">{l.name[lang]}</p>
                        <p className="text-xs text-muted">{l.variantLabel}</p>
                      </div>
                      <button onClick={() => remove(l.productId, l.variantId)} aria-label={t.cart.remove} className="text-muted hover:text-ember">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border hairline">
                        <button className="grid h-8 w-8 place-items-center" onClick={() => setQty(l.productId, l.variantId, l.qty - 1)} aria-label="-">
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm tabular-nums">{l.qty}</span>
                        <button className="grid h-8 w-8 place-items-center" onClick={() => setQty(l.productId, l.variantId, l.qty + 1)} aria-label="+">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-display text-xl">{money(l.total)}</span>
                    </div>
                  </div>
                </motion.li>
              )
            })}
            {upsell.length > 0 && (
              <li className="py-5">
                <p className="eyebrow mb-3">{t.cart.upsell}</p>
                <div className="grid grid-cols-2 gap-3">
                  {upsell.map((p) => (
                    <button key={p.id} onClick={() => add(p.id, p.variants[0].id)} className="group rounded-xl border hairline p-3 text-left hover:border-gold">
                      <CutArt shape={p.shape} bms={p.bms} seed={p.id} className="h-16 w-full" />
                      <p className="mt-2 text-sm font-semibold leading-tight">{p.name[lang]}</p>
                      <p className="mt-1 flex items-center justify-between text-xs text-muted">
                        {money(p.variants[0].price)} <Plus size={14} className="text-gold" />
                      </p>
                    </button>
                  ))}
                </div>
              </li>
            )}
          </ul>

          <div className="border-t hairline px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">{t.cart.subtotal}</span>
              <span className="font-display text-3xl">{money(subtotal)}</span>
            </div>
            <button onClick={() => setCheckoutOpen(true)} className="btn-gold mt-4 w-full">
              {t.cart.checkout}
            </button>
            <button onClick={() => openWhatsApp(`${t.wa.hello}\n${t.wa.order}\n\n${cartText(lines, lang)}\n\n${t.cart.subtotal}: ${money(subtotal)}`)} className="btn-ghost mt-2 w-full">
              <MessageCircle size={15} /> {t.cart.whats}
            </button>
          </div>
        </>
      )}
    </Overlay>
  )
}
