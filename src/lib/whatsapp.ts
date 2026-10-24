import { SITE } from '../config/site'
import { DICTS, type Lang } from '../i18n/dict'
import type { ResolvedLine } from '../store/cart'
import { money } from './format'

export const waLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`

export const openWhatsApp = (text: string) => {
  window.open(waLink(text), '_blank', 'noopener,noreferrer')
}

export const cartText = (lines: ResolvedLine[], lang: Lang) =>
  lines.map((l) => `• ${l.qty} × ${l.name[lang]} (${l.variantLabel}) — ${money(l.total)}`).join('\n')

export interface OrderInfo {
  ref: string
  name: string
  phone: string
  email?: string
  nit?: string
  zone: string
  address: string
  date: string
  slot: string
  notes?: string
  method: string
  delivery: number
  subtotal: number
}

export const orderMessage = (lines: ResolvedLine[], o: OrderInfo, lang: Lang) => {
  const t = DICTS[lang]
  const total = o.subtotal + o.delivery
  const rows: Array<string | false> = [
    t.wa.hello,
    `${t.wa.order} *#${o.ref}*`,
    '',
    cartText(lines, lang),
    '',
    `${t.cart.subtotal}: ${money(o.subtotal)}`,
    `${t.checkout.delivery}: ${o.delivery === 0 ? '—' : money(o.delivery)}`,
    `*${t.checkout.total}: ${money(total)}*`,
    '',
    `👤 ${o.name} · ${o.phone}`,
    !!o.email && `✉️ ${o.email}`,
    !!o.nit && `🧾 NIT/CI: ${o.nit}`,
    `📍 ${o.zone}${o.address ? ` — ${o.address}` : ''}`,
    `🗓️ ${o.date} · ${o.slot}`,
    `💳 ${t.checkout.methods[o.method]?.t ?? o.method}`,
    !!o.notes && `📝 ${o.notes}`,
  ]
  return rows.filter((x) => x !== false).join('\n')
}
