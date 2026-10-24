import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useT } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { FadeUp, RevealLines } from '../ui/Reveal'

export function MarblingLab() {
  const { t } = useT()
  const [bms, setBms] = useState(9)
  const level = t.marbling.levels.find((l) => bms <= l.max) ?? t.marbling.levels[t.marbling.levels.length - 1]

  return (
    <section id="marbling" className="relative mx-auto max-w-[1500px] px-4 py-28 md:px-10 md:py-40">
      <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="eyebrow">{t.marbling.eyebrow}</p>
          <h2 className="h-display mt-4 text-6xl md:text-8xl">
            <RevealLines lines={[t.marbling.title]} />
          </h2>
          <FadeUp delay={0.1}>
            <p className="mt-8 max-w-lg leading-relaxed text-ink/70">{t.marbling.body}</p>
          </FadeUp>

          <FadeUp delay={0.2} className="mt-12">
            <div className="flex items-end justify-between">
              <span className="text-[0.68rem] uppercase tracking-luxe text-muted">{t.marbling.slider}</span>
              <span className="font-display text-7xl leading-none tabular-nums text-gold">
                {bms}
                <span className="ml-1 font-sans text-sm text-muted">/12</span>
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={bms}
              onChange={(e) => setBms(Number(e.target.value))}
              aria-label="BMS"
              className="mt-5 h-1 w-full cursor-grab appearance-none rounded-full bg-ink/10 accent-[rgb(var(--gold))] active:cursor-grabbing"
              style={{ background: `linear-gradient(to right, rgb(var(--gold)) ${((bms - 1) / 11) * 100}%, rgb(var(--ink) / 0.12) 0)` }}
            />
            <div className="mt-2 flex justify-between text-[0.6rem] text-muted">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={level.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="mt-8 border-l-2 border-gold pl-5">
                <div className="font-display text-3xl">{level.name}</div>
                <div className="mt-1 text-sm text-ink/65">{level.note}</div>
              </motion.div>
            </AnimatePresence>
          </FadeUp>

          <div className="mt-14 grid grid-cols-3 border-t hairline pt-8">
            {t.marbling.stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-4xl text-gold">{s.v}</div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <FadeUp className="relative">
          <div className="absolute inset-[8%] rounded-full bg-wagyu/25 blur-[90px]" />
          <div className="relative aspect-[4/3] rounded-[2rem] border hairline bg-[radial-gradient(circle_at_50%_40%,rgb(var(--raised)),rgb(var(--surface)))] p-6 md:p-10">
            <CutArt shape="ribeye" bms={bms} seed="lab" className="h-full w-full transition-all duration-500" />
            <div className="absolute left-6 top-6 chip text-muted md:left-10 md:top-10">Ribeye · cross-section</div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
