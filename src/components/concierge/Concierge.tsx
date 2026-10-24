import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, MessageCircle, Plus, ShoppingBag, Sparkles, X } from 'lucide-react'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { productById } from '../../data/products'
import { money } from '../../lib/format'
import { cartText, openWhatsApp } from '../../lib/whatsapp'
import { useCart, useCartSummary } from '../../store/cart'
import { useT, useUI } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { localReply } from './localBrain'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const TOKEN = /\[\[(product:[a-z0-9-]+|whatsapp|checkout|error)\]\]/g

/** **bold** → <strong> */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>))
}

export function Concierge() {
  const { t, lang } = useT()
  const { conciergeOpen: open, setConciergeOpen: setOpen, setCheckoutOpen, cartOpen, checkoutOpen } = useUI()
  const add = useCart((s) => s.add)
  const lastAddedAt = useCart((s) => s.lastAddedAt)
  const { lines, subtotal, count } = useCartSummary()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [added, setAdded] = useState<string | null>(null)
  const remote = useRef(true)
  const scroller = useRef<HTMLDivElement>(null)

  // Funnel nudge: cart has items and the visitor has gone quiet for a while
  useEffect(() => {
    if (!count || open || cartOpen || checkoutOpen) return setNudge(false)
    const id = setTimeout(() => setNudge(true), 40000)
    return () => clearTimeout(id)
  }, [count, open, cartOpen, checkoutOpen, lastAddedAt])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy])

  const cartContext = () => (lines.length ? `${cartText(lines, 'en')}\nSubtotal: ${money(subtotal)}` : 'empty')

  const handOff = () => {
    const transcript = msgs
      .filter((m) => m.role === 'user')
      .slice(-4)
      .map((m) => `– ${m.content}`)
      .join('\n')
    openWhatsApp([t.wa.hello, t.wa.chat, transcript, lines.length ? `\n🛒\n${cartText(lines, lang)}\n${t.cart.subtotal}: ${money(subtotal)}` : ''].filter(Boolean).join('\n'))
  }

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || busy) return
    const history: Msg[] = [...msgs, { role: 'user', content }]
    setMsgs([...history, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)

    const setLast = (fn: (s: string) => string) =>
      setMsgs((m) => {
        const copy = m.slice()
        copy[copy.length - 1] = { role: 'assistant', content: fn(copy[copy.length - 1].content) }
        return copy
      })

    const fallback = () => setLast(() => localReply(content, lang))

    if (!remote.current) {
      await new Promise((r) => setTimeout(r, 500))
      fallback()
      return setBusy(false)
    }
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, lang, cart: cartContext() }),
      })
      if (res.status === 503 || res.status === 404 || res.status === 405) {
        remote.current = false // backend not deployed/configured → scripted concierge
        fallback()
      } else if (!res.ok || !res.body) {
        setLast(() => `${t.concierge.error}\n[[whatsapp]]`)
      } else {
        const reader = res.body.getReader()
        const dec = new TextDecoder()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = dec.decode(value, { stream: true })
          setLast((s) => s + chunk)
        }
      }
    } catch {
      remote.current = false
      fallback()
    }
    setBusy(false)
  }

  const renderContent = (content: string, key: number) => {
    const out: ReactNode[] = []
    const actions: ReactNode[] = []
    let last = 0
    for (const m of content.matchAll(TOKEN)) {
      out.push(inline(content.slice(last, m.index)))
      last = m.index! + m[0].length
      const tok = m[1]
      if (tok.startsWith('product:')) {
        const p = productById(tok.slice(8))
        if (!p) continue
        const v = p.variants[0]
        actions.push(
          <div key={`${key}-${tok}`} className="mt-2 flex items-center gap-3 rounded-2xl border hairline bg-bg/60 p-2 pr-3">
            <div className="h-12 w-14 shrink-0 rounded-xl bg-surface">
              <CutArt shape={p.shape} bms={p.bms} seed={p.id} className="h-full w-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.82rem] font-semibold">{p.name[lang]}</p>
              <p className="text-xs text-muted">
                {v.label} · {money(v.price)}
              </p>
            </div>
            <button
              onClick={() => {
                add(p.id, v.id)
                setAdded(p.id)
                setTimeout(() => setAdded(null), 1200)
              }}
              className="flex h-8 items-center gap-1 rounded-full bg-gold px-3 text-[0.65rem] font-bold uppercase tracking-wider text-bg"
            >
              {added === p.id ? '✓' : <Plus size={12} />} {t.concierge.add}
            </button>
          </div>,
        )
      } else if (tok === 'whatsapp' || tok === 'error') {
        actions.push(
          <button key={`${key}-wa`} onClick={handOff} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-xs font-bold uppercase tracking-wider text-[#06361a]">
            <MessageCircle size={14} /> {t.concierge.whats}
          </button>,
        )
      } else if (tok === 'checkout' && count > 0) {
        actions.push(
          <button key={`${key}-co`} onClick={() => (setOpen(false), setCheckoutOpen(true))} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-2.5 text-xs font-bold uppercase tracking-wider text-bg">
            <ShoppingBag size={14} /> {t.cart.checkout} · {money(subtotal)}
          </button>,
        )
      }
    }
    // hide a half-streamed token like "[[prod"
    out.push(inline(content.slice(last).replace(/\[\[[^\]]*$/, '')))
    return { text: out, actions }
  }

  const all: Msg[] = [{ role: 'assistant', content: t.concierge.greeting }, ...msgs]

  return (
    <>
      <AnimatePresence>
        {nudge && !open && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => (setNudge(false), setOpen(true), send(t.concierge.nudge))}
            className="fixed bottom-24 right-4 z-[60] max-w-[240px] rounded-2xl rounded-br-sm border hairline bg-raised px-4 py-3 text-left text-sm shadow-2xl md:right-8"
          >
            {t.concierge.nudge}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => (setOpen(!open), setNudge(false))}
        aria-label={t.concierge.open}
        className="fixed bottom-5 right-4 z-[60] grid h-14 w-14 place-items-center rounded-full bg-gold text-bg shadow-[0_10px_40px_-5px_rgb(var(--gold)/0.6)] md:bottom-8 md:right-8 md:h-16 md:w-16"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-gold/30 [animation-duration:2.8s]" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'o'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
            {open ? <X size={22} /> : <Sparkles size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="glass fixed inset-x-2 bottom-24 top-20 z-[60] flex flex-col overflow-hidden rounded-[1.6rem] border hairline shadow-2xl md:inset-x-auto md:bottom-28 md:right-8 md:top-auto md:h-[620px] md:max-h-[calc(100svh-9rem)] md:w-[400px]"
            role="dialog"
            aria-label={t.concierge.name}
            data-lenis-prevent
          >
            <div className="flex items-center gap-3 border-b hairline px-5 py-4">
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold to-ember font-display text-lg italic text-bg">
                D<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-[#25D366]" />
              </div>
              <div className="flex-1">
                <p className="font-display text-xl leading-none">{t.concierge.name}</p>
                <p className="mt-1 text-[0.65rem] text-muted">{t.concierge.status}</p>
              </div>
              <button onClick={handOff} className="grid h-9 w-9 place-items-center rounded-full text-[#25D366] hover:bg-ink/5" aria-label={t.concierge.whats} title={t.concierge.whats}>
                <MessageCircle size={18} />
              </button>
            </div>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
              {all.map((m, i) => {
                const { text, actions } = renderContent(m.content, i)
                const typing = busy && i === all.length - 1 && !m.content
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {typing ? (
                      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-raised px-4 py-3.5">
                        {[0, 1, 2].map((d) => (
                          <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }} />
                        ))}
                      </div>
                    ) : (
                      <div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-[0.86rem] leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-gold text-bg' : 'rounded-bl-sm bg-raised'}`}>
                        {text}
                      </div>
                    )}
                    {actions.length > 0 && <div className="w-[88%]">{actions}</div>}
                  </motion.div>
                )
              })}
              {msgs.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {t.concierge.quick.map((q) => (
                    <button key={q} onClick={() => send(q)} className="rounded-full border hairline px-3 py-1.5 text-xs text-ink/80 hover:border-gold hover:text-gold">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t hairline p-3"
            >
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.concierge.placeholder} className="field rounded-full py-2.5" maxLength={2000} />
              <button type="submit" disabled={busy || !input.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-bg disabled:opacity-40" aria-label="Send">
                <ArrowUp size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
