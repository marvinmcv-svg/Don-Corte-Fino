import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { PRODUCTS } from '../../data/products'
import { money } from '../../lib/format'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useT, useUI } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { Photo } from '../ui/Photo'

/** Pinned horizontal showcase: vertical scroll translates a track of featured cuts. */
export function SignatureCuts() {
  const { t, lang } = useT()
  const setQuickView = useUI((s) => s.setQuickView)
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const featured = PRODUCTS.filter((p) => p.featured)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      const el = track.current!
      const distance = () => el.scrollWidth - window.innerWidth
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: 1, pin: true, invalidateOnRefresh: true },
      })
      gsap.utils.toArray<HTMLElement>('.sc-art').forEach((art) => {
        gsap.fromTo(art, { rotate: -8 }, { rotate: 8, ease: 'none', scrollTrigger: { trigger: art, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} className="relative overflow-hidden py-24 md:flex md:h-[100svh] md:items-center md:py-0">
      <div ref={track} className="no-scrollbar flex gap-6 overflow-x-auto px-4 md:gap-10 md:overflow-visible md:px-10">
        <div className="flex w-[80vw] shrink-0 flex-col justify-center md:w-[34vw]">
          <p className="eyebrow">{t.signature.eyebrow}</p>
          <h2 className="h-display mt-4 text-6xl md:text-[7vw]">
            {t.signature.title.split(' ').map((w, i) => (
              <span key={i} className={i === 1 ? 'block italic text-gold' : 'block'}>
                {w}
              </span>
            ))}
          </h2>
        </div>
        {featured.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setQuickView(p.id)}
            className="group relative flex h-[62vh] w-[78vw] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border hairline bg-surface p-7 text-left md:h-[72vh] md:w-[38vw]"
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-7xl italic leading-none text-ink/10">0{i + 1}</span>
              <span className="chip text-gold">BMS {p.bms}</span>
            </div>
            <Photo
              src={p.image}
              alt={p.name[lang]}
              className="sc-art absolute inset-x-0 top-[14%] h-[52%]"
              fallback={<CutArt shape={p.shape} bms={p.bms} seed={p.id} className="h-full w-full px-6" />}
            />
            <div className="relative">
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">{p.origin[lang]}</p>
              <h3 className="mt-1 font-display text-4xl md:text-5xl">{p.name[lang]}</h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-2xl text-gold">
                  <span className="mr-1 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-muted">{t.shop.from}</span>
                  {money(p.variants[0].price)}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-full border hairline transition-all duration-500 group-hover:rotate-[-45deg] group-hover:bg-gold group-hover:text-bg">
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </button>
        ))}
        <div className="w-4 shrink-0 md:w-[10vw]" />
      </div>
    </section>
  )
}
