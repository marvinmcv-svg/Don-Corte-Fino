import { MessageCircle } from 'lucide-react'
import { Instagram } from '../ui/InstagramIcon'
import { SITE } from '../../config/site'
import { waLink } from '../../lib/whatsapp'
import { useT } from '../../store/ui'
import { Logo } from '../ui/Logo'

export function Footer() {
  const { t } = useT()
  const pays = ['QR Simple', 'Tigo Money', 'Transferencia', 'Visa', 'Mastercard', 'Efectivo']
  return (
    <footer className="relative overflow-hidden border-t hairline pt-20">
      <div className="mx-auto max-w-[1500px] px-4 md:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="text-xl">
            <Logo />
            <p className="mt-6 max-w-xs text-sm text-muted">{t.footer.crafted}</p>
          </div>
          <div>
            <p className="eyebrow">{t.footer.payments}</p>
            <div className="mt-4 flex max-w-sm flex-wrap gap-2">
              {pays.map((p) => (
                <span key={p} className="chip text-ink/70">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <a href={SITE.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-gold hover:text-gold">
              <Instagram size={18} />
            </a>
            <a href={waLink(t.wa.hello)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-12 w-12 place-items-center rounded-full border hairline hover:border-gold hover:text-gold">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="pointer-events-none mt-16 select-none whitespace-nowrap text-center font-display text-[16.5vw] italic leading-[0.8] text-ink/[0.06]">Don Corte Fino</div>
      <div className="mx-auto flex max-w-[1500px] justify-between border-t hairline px-4 py-6 text-[0.65rem] uppercase tracking-[0.18em] text-muted md:px-10">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>{t.footer.rights}</span>
      </div>
    </footer>
  )
}
