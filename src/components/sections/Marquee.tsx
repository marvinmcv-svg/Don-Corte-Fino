import { useT } from '../../store/ui'

export function Marquee() {
  const { t } = useT()
  const items = [...t.marquee, ...t.marquee]
  return (
    <div className="relative overflow-hidden border-y hairline py-6">
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap">
        {items.map((m, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-3xl italic md:text-5xl">
            <span className={i % 2 ? 'text-outline' : ''}>{m}</span>
            <span className="text-base not-italic text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
