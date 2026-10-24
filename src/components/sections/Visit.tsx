import { ArrowUpRight, Clock, MapPin, MessageCircle } from 'lucide-react'
import { SITE } from '../../config/site'
import { waLink } from '../../lib/whatsapp'
import { useT } from '../../store/ui'
import { CutArt } from '../ui/CutArt'
import { Magnetic } from '../ui/Magnetic'
import { FadeUp, RevealLines } from '../ui/Reveal'

export function Visit() {
  const { t, lang } = useT()
  return (
    <section id="visit" className="relative mx-auto max-w-[1500px] px-4 py-28 md:px-10 md:py-40">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <p className="eyebrow">{t.visit.eyebrow}</p>
          <h2 className="h-display mt-4 text-6xl md:text-8xl">
            <RevealLines lines={[t.visit.title]} />
          </h2>
          <FadeUp>
            <p className="mt-6 max-w-md leading-relaxed text-ink/70">{t.visit.body}</p>
          </FadeUp>
          <FadeUp delay={0.1} className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="border-t hairline pt-5">
              <MapPin size={18} className="text-gold" />
              <p className="mt-3 text-sm">{SITE.address.line}</p>
              <a href={SITE.address.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                {t.visit.directions} <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="border-t hairline pt-5">
              <Clock size={18} className="text-gold" />
              <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-muted">{t.visit.hours}</p>
              {SITE.hours[lang].map((h) => (
                <p key={h} className="mt-1 text-sm">
                  {h}
                </p>
              ))}
            </div>
          </FadeUp>
          <FadeUp delay={0.2} className="mt-10">
            <Magnetic>
              <a href={waLink(t.wa.hello)} target="_blank" rel="noreferrer" className="btn-gold">
                <MessageCircle size={16} /> {t.visit.whats}
              </a>
            </Magnetic>
          </FadeUp>
        </div>
        <FadeUp className="relative overflow-hidden rounded-[2rem] border hairline bg-[radial-gradient(circle_at_30%_20%,#3a2414,#120d0a_70%)]">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative flex aspect-[4/3] items-center justify-center p-10">
            <CutArt shape="tomahawk" bms={8} seed="visit" seared className="w-full max-w-lg" />
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-[#f3ece2]">
            <div>
              <p className="font-display text-3xl italic">Don Corte Fino</p>
              <p className="text-[0.62rem] uppercase tracking-luxe text-white/60">Santa Cruz de la Sierra · BO</p>
            </div>
            <span className="font-display text-5xl text-[#c8a165]">17°48′S</span>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
