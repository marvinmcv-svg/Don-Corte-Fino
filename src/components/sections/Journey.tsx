import { useEffect, useRef, useState } from 'react'
import { JOURNEY_PHOTOS } from '../../data/media'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { Photo } from '../ui/Photo'

/**
 * "Scroll-world" flight, adapted from oso95/scroll-world: scroll drives a camera that
 * starts OUTSIDE each scene (a floating framed diorama), dives INTO it until it fills
 * the screen, then flies through and out into the next scene — one continuous,
 * uncut journey. Instead of AI-rendered video clips, each scene is a photo (or the
 * procedural fallback) and the camera move is a scrubbed GSAP timeline.
 */

const GRADES = [
  'radial-gradient(120% 90% at 30% 20%, #4a3a1c 0%, #1d1a10 45%, #0b0908 100%)', // pasture dusk
  'radial-gradient(120% 90% at 70% 30%, #2a3138 0%, #14181b 50%, #0b0908 100%)', // cold chamber
  'radial-gradient(120% 90% at 40% 30%, #4a2a18 0%, #1f130c 50%, #0b0908 100%)', // butcher's block
  'radial-gradient(120% 90% at 50% 80%, #8a2e0c 0%, #2a0f06 50%, #0b0908 100%)', // fire
  'radial-gradient(120% 90% at 50% 30%, #4b3a26 0%, #1c150e 50%, #0b0908 100%)', // candlelit table
]

export function Journey() {
  const { t } = useT()
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [reduced] = useState(prefersReducedMotion)
  const scenes = t.journey.scenes
  const N = scenes.length

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const frames = gsap.utils.toArray<HTMLElement>('.jw-frame')
      const copies = gsap.utils.toArray<HTMLElement>('.jw-copy')
      const nums = gsap.utils.toArray<HTMLElement>('.jw-num')

      gsap.set(frames, { scale: 0.18, opacity: 0, borderRadius: 32 })
      gsap.set(frames[0], { scale: 0.52, opacity: 1 })
      gsap.set(copies, { opacity: 0, y: 40 })
      gsap.set(nums, { opacity: 0, yPercent: 30 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * N * 1.6}`,
          scrub: 1,
          pin: '.jw-stage',
          anticipatePin: 1,
          onUpdate: (self) => setActive(Math.min(N - 1, Math.floor(self.progress * N * 0.999))),
        },
      })

      frames.forEach((frame, i) => {
        const img = frame.querySelector('.jw-media')
        const at = i * 1
        // dive: outside → filling the screen
        tl.to(frame, { scale: 1, borderRadius: 0, duration: 0.45, ease: 'power2.inOut' }, at)
          .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 0.45, ease: 'power2.inOut' }, at)
          .to(copies[i], { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, at + 0.22)
          .to(nums[i], { opacity: 1, yPercent: 0, duration: 0.25 }, at + 0.15)
        if (i < N - 1) {
          // connector: fly through and out, the next scene emerges from the vanishing point
          tl.to(copies[i], { opacity: 0, y: -40, duration: 0.14 }, at + 0.7)
            .to(nums[i], { opacity: 0, yPercent: -30, duration: 0.2 }, at + 0.7)
            .to(frame, { scale: 2.4, opacity: 0, duration: 0.3, ease: 'power2.in' }, at + 0.7)
            .to(frames[i + 1], { scale: 0.52, opacity: 1, duration: 0.3, ease: 'power2.out' }, at + 0.72)
        }
      })
    }, root)
    return () => ctx.revert()
  }, [N, reduced])

  return (
    <section id="journey" ref={root} className="relative">
      <div className={`jw-stage relative w-full overflow-hidden ${reduced ? '' : 'h-[100svh]'}`}>
        {/* atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgb(var(--gold)/0.08),transparent)]" />
        <div className="absolute left-4 top-24 z-20 md:left-10 md:top-28">
          <p className="eyebrow">{t.journey.eyebrow}</p>
          <h2 className="h-display mt-3 text-4xl md:text-6xl">{t.journey.title}</h2>
        </div>

        {scenes.map((s, i) => (
          <div key={i} className={`jw-frame overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] will-change-transform ${reduced ? 'relative h-[100svh]' : 'absolute inset-0'}`}>
            <div className="jw-media absolute inset-0" style={{ background: GRADES[i] }}>
              <Photo
                src={JOURNEY_PHOTOS[i].src}
                alt={s.title}
                className="absolute inset-0"
                fallback={
                  <div className="absolute inset-0 grid place-items-center">
                    <CutArt shape={JOURNEY_PHOTOS[i].shape} bms={JOURNEY_PHOTOS[i].bms} seed={`j${i}`} seared={i === 3} className="w-[80vmin] max-w-[900px] opacity-90" />
                  </div>
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
            </div>
            <span className="jw-num pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 font-display text-[42vmin] italic leading-none text-white/[0.07] md:right-8">
              {s.k}
            </span>
            <div className="jw-copy absolute bottom-20 left-4 right-4 max-w-xl text-[#f3ece2] md:bottom-24 md:left-10">
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-luxe text-[#c8a165]">
                {s.k} · {String(i + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
              </p>
              <h3 className="h-display mt-3 text-6xl md:text-8xl">{s.title}</h3>
              <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/75">{s.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {s.tags.map((tag) => (
                  <span key={tag} className="chip border-white/25 text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* progress rail */}
        <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 md:right-10 md:flex">
          {scenes.map((s, i) => (
            <div key={i} className="flex items-center justify-end gap-3">
              <span className={`text-[0.62rem] uppercase tracking-[0.2em] transition-all duration-500 ${active === i ? 'text-[#f3ece2] opacity-100' : 'opacity-0'}`}>{s.title}</span>
              <span className={`h-px transition-all duration-500 ${active === i ? 'w-10 bg-[#c8a165]' : 'w-4 bg-white/30'}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
