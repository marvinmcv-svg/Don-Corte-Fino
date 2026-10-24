import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, Building2, Check, Copy, CreditCard, MessageCircle, QrCode, Smartphone, X } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState, type ReactNode } from 'react'
import { SITE } from '../../config/site'
import { money, orderRef } from '../../lib/format'
import { openWhatsApp, orderMessage, type OrderInfo } from '../../lib/whatsapp'
import { useCart, useCartSummary } from '../../store/cart'
import { useT, useUI } from '../../store/ui'
import { Overlay } from '../ui/Overlay'

type Method = 'qr' | 'tigo' | 'transfer' | 'card' | 'cash'
const METHODS: Array<{ id: Method; icon: ReactNode }> = [
  { id: 'qr', icon: <QrCode size={20} /> },
  { id: 'tigo', icon: <Smartphone size={20} /> },
  { id: 'transfer', icon: <Building2 size={20} /> },
  { id: 'card', icon: <CreditCard size={20} /> },
  { id: 'cash', icon: <Banknote size={20} /> },
]

const tomorrow = () => {
  const d = new Date(Date.now() + 864e5)
  return d.toISOString().slice(0, 10)
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [ok, setOk] = useState(false)
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted">{label}</span>
      <button
        className="flex items-center gap-2 font-semibold tabular-nums hover:text-gold"
        onClick={() => {
          navigator.clipboard?.writeText(value)
          setOk(true)
          setTimeout(() => setOk(false), 1200)
        }}
      >
        {value} {ok ? <Check size={14} className="text-gold" /> : <Copy size={14} className="opacity-50" />}
      </button>
    </div>
  )
}

function QrPanel({ amount, reference }: { amount: number; reference: string }) {
  const { t } = useT()
  const [src, setSrc] = useState<string>(SITE.payments.qrImage)
  const [left, setLeft] = useState(15 * 60)

  useEffect(() => {
    if (SITE.payments.qrImage) return
    // Without the bank's QR Simple image we encode the order reference so the
    // cashier can match the payment; configure SITE.payments.qrImage for production.
    QRCode.toDataURL(`${SITE.name}|${reference}|BOB ${amount.toFixed(2)}`, { margin: 1, width: 520, color: { dark: '#0b0908', light: '#f3ece2' } }).then(setSrc)
  }, [amount, reference])

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
      <div className="mt-4 grid items-center gap-6 rounded-2xl border border-gold/30 bg-gold/5 p-5 sm:grid-cols-[180px_1fr]">
        <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-xl bg-[#f3ece2] p-2 sm:w-full">
          {src && <img src={src} alt="QR" className="h-full w-full object-contain" />}
          <motion.div className="absolute inset-x-2 h-0.5 bg-ember/70 shadow-[0_0_12px_rgb(var(--ember))]" animate={{ top: ['8%', '92%', '8%'] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div>
          <p className="font-display text-2xl">{t.checkout.qrScan}</p>
          <p className="mt-1 font-display text-4xl text-gold">{money(amount)}</p>
          <p className="mt-2 text-xs text-muted">
            {t.checkout.ref}: <span className="font-semibold text-ink">{reference}</span>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink/65">{t.checkout.qrNote}</p>
          <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            {t.checkout.qrExpires} · <span className="tabular-nums text-ink">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted">
            {['BNB', 'BCP', 'Mercantil', 'Unión', 'Ganadero', 'Económico', 'Sol'].map((b) => (
              <span key={b} className="rounded border hairline px-1.5 py-0.5">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Checkout() {
  const { t, lang } = useT()
  const { checkoutOpen, setCheckoutOpen } = useUI()
  const clear = useCart((s) => s.clear)
  const { lines, subtotal } = useCartSummary()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [method, setMethod] = useState<Method>('qr')
  const [lastMessage, setLastMessage] = useState('')
  const [reference, setReference] = useState(orderRef)
  const [f, setF] = useState({ name: '', phone: '', email: '', nit: '', zone: SITE.delivery[0].id as string, address: '', date: tomorrow(), slot: t.checkout.slots[1], notes: '' })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }))

  const zone = SITE.delivery.find((z) => z.id === f.zone)!
  const delivery = subtotal >= SITE.freeDeliveryFrom ? 0 : zone.fee
  const total = subtotal + delivery

  const close = () => {
    setCheckoutOpen(false)
    setTimeout(() => {
      setStep(0)
      setError('')
      setReference(orderRef())
    }, 500)
  }

  const next = () => {
    if (step === 0 && (!f.name.trim() || f.phone.replace(/\D/g, '').length < 7)) return setError(t.checkout.required)
    if (step === 1 && zone.id !== 'pickup' && !f.address.trim()) return setError(t.checkout.required)
    setError('')
    setStep((s) => s + 1)
  }

  const confirm = () => {
    const info: OrderInfo = { ...f, ref: reference, zone: zone.name, method, delivery, subtotal }
    const msg = orderMessage(lines, info, lang)
    setLastMessage(msg)
    openWhatsApp(msg)
    clear()
    setStep(3)
  }

  return (
    <Overlay open={checkoutOpen} onClose={close} label={t.cart.checkout}>
      <div className="flex items-center justify-between border-b hairline px-6 py-5 md:px-10">
        <div className="flex gap-2 md:gap-6">
          {t.checkout.steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${i <= step ? 'text-ink' : 'text-muted/60'}`}>
              <span className={`grid h-6 w-6 place-items-center rounded-full border text-[0.6rem] transition-colors ${i < step ? 'border-gold bg-gold text-bg' : i === step ? 'border-gold text-gold' : 'hairline'}`}>
                {i < step ? <Check size={12} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </div>
          ))}
        </div>
        <button onClick={close} aria-label={t.checkout.close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5">
          <X size={18} />
        </button>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr]">
        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }}>
              {step === 0 && (
                <div className="grid gap-3">
                  <input className="field" placeholder={`${t.checkout.name} *`} value={f.name} onChange={set('name')} autoComplete="name" />
                  <input className="field" placeholder={`${t.checkout.phone} *`} value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" />
                  <input className="field" placeholder={t.checkout.email} value={f.email} onChange={set('email')} type="email" autoComplete="email" />
                  <input className="field" placeholder={t.checkout.nit} value={f.nit} onChange={set('nit')} />
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-3">
                  <label className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">{t.checkout.zone}</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SITE.delivery.map((z) => (
                      <button
                        key={z.id}
                        onClick={() => setF((s) => ({ ...s, zone: z.id }))}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${f.zone === z.id ? 'border-gold bg-gold/10' : 'hairline hover:border-ink/30'}`}
                      >
                        <span>{z.name}</span>
                        <span className="text-xs text-muted">{z.fee === 0 ? '—' : money(z.fee)}</span>
                      </button>
                    ))}
                  </div>
                  {f.zone !== 'pickup' && <input className="field mt-2" placeholder={`${t.checkout.address} *`} value={f.address} onChange={set('address')} autoComplete="street-address" />}
                  <div className="grid grid-cols-2 gap-3">
                    <input className="field" type="date" value={f.date} min={new Date().toISOString().slice(0, 10)} onChange={set('date')} aria-label={t.checkout.date} />
                    <select className="field bg-bg" value={f.slot} onChange={set('slot')} aria-label={t.checkout.slot}>
                      {t.checkout.slots.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <textarea className="field min-h-[90px]" placeholder={t.checkout.notes} value={f.notes} onChange={set('notes')} />
                </div>
              )}
              {step === 2 && (
                <div>
                  <p className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-muted">{t.checkout.pay}</p>
                  <div className="grid gap-2">
                    {METHODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors ${method === m.id ? 'border-gold bg-gold/10' : 'hairline hover:border-ink/30'}`}
                      >
                        <span className={method === m.id ? 'text-gold' : 'text-muted'}>{m.icon}</span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">{t.checkout.methods[m.id].t}</span>
                          <span className="block text-xs text-muted">{t.checkout.methods[m.id].d}</span>
                        </span>
                        <span className={`h-4 w-4 rounded-full border-2 ${method === m.id ? 'border-gold bg-gold' : 'hairline'}`} />
                      </button>
                    ))}
                  </div>
                  {method === 'qr' && <QrPanel amount={total} reference={reference} />}
                  {method === 'tigo' && (
                    <div className="mt-4 rounded-2xl border hairline px-5 py-2">
                      <CopyRow label="Tigo Money" value={SITE.payments.tigoMoney} />
                      <CopyRow label={t.checkout.ref} value={reference} />
                    </div>
                  )}
                  {method === 'transfer' && (
                    <div className="mt-4 divide-y divide-[rgb(var(--line)/0.08)] rounded-2xl border hairline px-5 py-2">
                      <CopyRow label="Banco" value={SITE.payments.bank.name} />
                      <CopyRow label="Titular" value={SITE.payments.bank.holder} />
                      <CopyRow label="Cuenta" value={SITE.payments.bank.account} />
                      <CopyRow label="NIT" value={SITE.payments.bank.nit} />
                      <CopyRow label={t.checkout.ref} value={reference} />
                    </div>
                  )}
                  {method === 'card' &&
                    (SITE.payments.cardLink ? (
                      <a href={SITE.payments.cardLink} target="_blank" rel="noreferrer" className="btn-ghost mt-4 w-full">
                        <CreditCard size={15} /> Visa · Mastercard
                      </a>
                    ) : (
                      <p className="mt-4 rounded-2xl border hairline p-4 text-sm text-ink/70">{t.checkout.cardSoon}</p>
                    ))}
                </div>
              )}
              {step === 3 && (
                <div className="py-6 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold text-bg">
                    <Check size={36} />
                  </motion.div>
                  <h3 className="h-display mt-8 text-5xl">{t.checkout.doneTitle}</h3>
                  <p className="mx-auto mt-4 max-w-sm text-ink/70">{t.checkout.doneBody}</p>
                  <p className="mt-4 text-xs text-muted">
                    {t.checkout.ref}: <span className="font-semibold text-ink">{reference}</span>
                  </p>
                  <button className="btn-gold mt-8" onClick={() => openWhatsApp(lastMessage)}>
                    <MessageCircle size={15} /> {t.checkout.doneAgain}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="mt-4 text-sm text-ember">{error}</p>}

          {step < 3 && (
            <div className="mt-8 flex gap-3">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                  {t.checkout.back}
                </button>
              )}
              {step < 2 ? (
                <button onClick={next} className="btn-gold flex-1">
                  {t.checkout.next}
                </button>
              ) : (
                <button onClick={confirm} disabled={lines.length === 0} className="btn-gold flex-1 disabled:opacity-40">
                  <MessageCircle size={15} /> {method === 'qr' || method === 'tigo' || method === 'transfer' ? t.checkout.sendProof : t.checkout.confirm}
                </button>
              )}
            </div>
          )}
        </div>

        {step < 3 && (
          <aside className="border-t hairline bg-surface/60 p-6 md:border-l md:border-t-0 md:p-10">
            <ul className="space-y-3 text-sm">
              {lines.map((l) => (
                <li key={`${l.productId}-${l.variantId}`} className="flex justify-between gap-4">
                  <span>
                    {l.qty} × {l.name[lang]} <span className="text-muted">· {l.variantLabel}</span>
                  </span>
                  <span className="tabular-nums">{money(l.total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 border-t hairline pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{t.cart.subtotal}</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.checkout.delivery}</span>
                <span>{delivery === 0 ? '—' : money(delivery)}</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted">{t.checkout.total}</span>
                <span className="font-display text-4xl text-gold">{money(total)}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </Overlay>
  )
}
