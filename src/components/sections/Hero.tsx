import { motion } from 'framer-motion'
import { ArrowDownRight, MessageCircle } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, scrollToId } from '../../lib/motion'
import { waLink } from '../../lib/whatsapp'
import { useT } from '../../store/ui'
import { Magnetic } from '../ui/Magnetic'

const WagyuScene = lazy(() => import('../three/WagyuScene'))

const ease = [0.16, 1, 0.3, 1] as const

export function Hero({ ready }: { ready: boolean }) {
  const { t, lang } = useT()
  const section = useRef<HTMLElement>(null)
  const scroll = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(true)

  // Stop rendering WebGL once the hero is off-screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(section.current!)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => (scroll.current = self.progress),
    })
    const tween = gsap.to('.hero-copy', {
      yPercent: -18,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true },
    })
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) }
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      st.kill()
      tween.scrollTrigger?.kill()
      tween.kill()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  const line = (text: string, i: number, cls = '') => (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={`block ${cls}`}
        initial={{ y: '115%' }}
        animate={ready ? { y: '0%' } : undefined}
        transition={{ duration: 1.3, ease, delay: 0.1 + i * 0.1 }}
      >
        {text}
      </motion.span>
    </span>
  )

  return (
    <section id="top" ref={section} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      {/* warm glow behind the steak */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[10%] h-[70vmin] w-[70vmin] rounded-full bg-ember/20 blur-[120px] md:right-[5%]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[60vmin] w-[60vmin] rounded-full bg-wagyu/20 blur-[140px]" />
      </div>

      <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={ready ? { opacity: 1, scale: 1 } : undefined} transition={{ duration: 2.2, ease }}>
        <Suspense fallback={null}>
          <WagyuScene scroll={scroll} pointer={pointer} active={visible} />
        </Suspense>
      </motion.div>

      <div className="hero-copy relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end px-4 pb-24 pt-28 md:justify-center md:px-10 md:pb-0">
        <motion.p className="eyebrow mb-6" initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1, ease, delay: 0.05 }}>
          {t.hero.eyebrow}
        </motion.p>
        <h1 key={lang} className="h-display text-[17vw] sm:text-[13vw] md:text-[8.6vw] xl:text-[8rem]">
          {line(t.hero.title1, 0)}
          {line(t.hero.title2, 1, 'italic text-gold')}
          {line(t.hero.title3, 2)}
        </h1>
        <motion.p
          className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-ink/75"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.1, ease, delay: 0.55 }}
        >
          {t.hero.body}
        </motion.p>
        <motion.div className="mt-10 flex flex-wrap gap-3" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1.1, ease, delay: 0.7 }}>
          <Magnetic>
            <button onClick={() => scrollToId('shop')} className="btn-gold">
              {t.hero.ctaShop} <ArrowDownRight size={16} />
            </button>
          </Magnetic>
          <Magnetic>
            <a href={waLink(t.wa.hello)} target="_blank" rel="noreferrer" className="btn-ghost">
              <MessageCircle size={16} /> {t.hero.ctaWhats}
            </a>
          </Magnetic>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4 }}
      >
        <span className="text-[0.6rem] uppercase tracking-luxe text-muted">{t.hero.scroll}</span>
        <span className="relative h-12 w-px overflow-hidden bg-ink/15">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-gold" animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.div>
    </section>
  )
}
