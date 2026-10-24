import { Instagram } from '../ui/InstagramIcon'
import { useEffect, useRef } from 'react'
import { SITE } from '../../config/site'
import { GALLERY } from '../../data/media'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { Photo } from '../ui/Photo'
import { RevealLines } from '../ui/Reveal'

const BG = ['#2a1712', '#1c1513', '#2b1d10', '#1a1716', '#2a1511', '#1f1712', '#25160f', '#1b1411']

/** Instagram wall with columns that drift at different speeds (parallax). */
export function Gallery() {
  const { t } = useT()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.g-col').forEach((col, i) => {
        gsap.fromTo(col, { yPercent: i % 2 ? 6 : -4 }, { yPercent: i % 2 ? -10 : 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const cols = [GALLERY.slice(0, 3), GALLERY.slice(3, 5), GALLERY.slice(5, 8)]
  let k = 0

  return (
    <section id="gallery" ref={root} className="relative overflow-hidden py-28 md:py-40">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-4 md:flex-row md:items-end md:px-10">
        <div>
          <p className="eyebrow">{t.gallery.eyebrow}</p>
          <h2 className="h-display mt-4 text-6xl md:text-8xl">
            <RevealLines lines={[t.gallery.title]} />
          </h2>
        </div>
        <a href={SITE.instagram.url} target="_blank" rel="noreferrer" className="btn-ghost self-start md:self-auto">
          <Instagram size={16} /> {t.gallery.follow} {SITE.instagram.handle}
        </a>
      </div>

      <div className="mx-auto mt-16 grid max-w-[1500px] grid-cols-2 gap-4 px-4 md:grid-cols-3 md:gap-6 md:px-10">
        {cols.map((col, ci) => (
          <div key={ci} className={`g-col flex flex-col gap-4 md:gap-6 ${ci === 2 ? 'hidden md:flex' : ''} ${ci === 1 ? 'md:pt-24' : ''}`}>
            {col.map((m) => {
              const i = k++
              return (
                <a
                  key={m.src}
                  href={SITE.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative block overflow-hidden rounded-[1.4rem] ${i % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}
                  style={{ background: BG[i % BG.length] }}
                >
                  <Photo
                    src={m.src}
                    alt="Don Corte Fino"
                    className="absolute inset-0 transition-transform duration-[1.4s] ease-expo group-hover:scale-110"
                    fallback={<CutArt shape={m.shape} bms={m.bms} seed={`g${i}`} seared={i % 4 === 1} className="absolute inset-0 h-full w-full scale-125 p-6" />}
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <Instagram size={18} className="text-white" />
                  </div>
                </a>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
