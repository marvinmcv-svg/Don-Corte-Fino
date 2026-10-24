import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, ShoppingBag, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { scrollToId } from '../../lib/motion'
import { useCart, useCartSummary } from '../../store/cart'
import { useT, useUI } from '../../store/ui'
import { Logo } from '../ui/Logo'

export function Nav() {
  const { t, lang } = useT()
  const { theme, toggleTheme, toggleLang, setCartOpen } = useUI()
  const { count } = useCartSummary()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  const lastAddedAt = useCart((s) => s.lastAddedAt)
  const pinnedUntil = useRef(0)

  // Reveal the header (and its cart badge) whenever something is added to the cart
  useEffect(() => {
    if (!lastAddedAt) return
    pinnedUntil.current = Date.now() + 2500
    setHidden(false)
  }, [lastAddedAt])

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > last && y > 400 && Date.now() > pinnedUntil.current)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    ['journey', t.nav.journey],
    ['marbling', t.nav.marbling],
    ['shop', t.nav.shop],
    ['gallery', t.nav.gallery],
    ['visit', t.nav.visit],
  ] as const

  const go = (id: string) => {
    setMenu(false)
    scrollToId(id)
  }

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menu ? -100 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-500 ${scrolled ? 'glass border-b hairline' : 'border-b border-transparent'}`}
      >
        <nav className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:h-20 md:px-10">
          <button onClick={() => go('top')} aria-label="Don Corte Fino" className="text-base md:text-lg">
            <Logo />
          </button>

          <ul className="hidden items-center gap-9 lg:flex">
            {links.map(([id, label]) => (
              <li key={id}>
                <button onClick={() => go(id)} className="group relative text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink/80 transition-colors hover:text-ink">
                  {label}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-500 ease-expo group-hover:origin-left group-hover:scale-x-100" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={toggleLang} className="rounded-full px-3 py-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ink/80 hover:text-gold" aria-label={t.ui.lang}>
              <span className={lang === 'es' ? 'text-gold' : ''}>ES</span>
              <span className="mx-1 text-muted">/</span>
              <span className={lang === 'en' ? 'text-gold' : ''}>EN</span>
            </button>
            <button onClick={toggleTheme} aria-label={t.ui.theme} className="grid h-10 w-10 place-items-center rounded-full text-ink/80 hover:text-gold">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }}>
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button onClick={() => setCartOpen(true)} aria-label={t.nav.cart} className="relative grid h-10 w-10 place-items-center rounded-full text-ink/80 hover:text-gold">
              <ShoppingBag size={19} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-bg"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => setMenu((m) => !m)} className="grid h-10 w-10 place-items-center lg:hidden" aria-label="Menu">
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-bg px-6 lg:hidden"
          >
            {links.map(([id, label], i) => (
              <motion.button
                key={id}
                onClick={() => go(id)}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.06, duration: 0.6 }}
                className="border-b hairline py-4 text-left font-display text-5xl"
              >
                <span className="mr-4 align-top font-sans text-xs text-gold">0{i + 1}</span>
                {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
