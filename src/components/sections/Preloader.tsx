import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../store/ui'

/** Counter + curtain-lift intro. Calls onDone when the page should start animating. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const { t } = useT()
  const root = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      onDone()
      root.current?.remove()
      return
    }
    const counter = { v: 0 }
    const tl = gsap.timeline()
    tl.to(counter, { v: 100, duration: 2.1, ease: 'power3.inOut', onUpdate: () => setN(Math.round(counter.v)) })
      .to('.pl-line', { scaleX: 1, duration: 2.1, ease: 'power3.inOut' }, 0)
      .from('.pl-word', { yPercent: 120, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.15)
      .to('.pl-word', { yPercent: -120, duration: 0.7, ease: 'expo.in', stagger: 0.04 }, '+=0.1')
      .add(onDone, '-=0.15')
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.3')
      .set(root.current, { display: 'none' })
    return () => {
      tl.kill()
    }
  }, [onDone])

  return (
    <div ref={root} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg" style={{ clipPath: 'inset(0 0 0% 0)' }}>
      <div className="overflow-hidden">
        <div className="flex gap-4 font-display text-5xl italic text-ink md:text-7xl">
          <span className="pl-word inline-block text-gold">Don</span>
          <span className="pl-word inline-block">Corte</span>
          <span className="pl-word inline-block">Fino</span>
        </div>
      </div>
      <div className="mt-10 w-56 md:w-72">
        <div className="pl-line h-px origin-left scale-x-0 bg-gold" />
        <div className="mt-3 flex justify-between text-[0.65rem] uppercase tracking-luxe text-muted">
          <span>{t.preloader.line}</span>
          <span className="tabular-nums text-ink">{String(n).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  )
}
