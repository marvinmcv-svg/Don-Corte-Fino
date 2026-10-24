import { SITE } from '../../config/site'
import type { Lang } from '../../i18n/dict'

/**
 * Offline concierge used when the AI backend isn't configured or reachable.
 * Keyword intents → scripted replies that use the same [[token]] protocol as the AI.
 */

const has = (q: string, words: string[]) => words.some((w) => q.includes(w))

export function localReply(input: string, lang: Lang): string {
  const q = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  const es = lang === 'es'
  const people = Number(q.match(/(\d+)\s*(personas|people|persons|invitados|guests|pax)?/)?.[1] ?? 0)

  if (has(q, ['humano', 'persona real', 'human', 'asesor', 'agent', 'whatsapp', 'llamar', 'call', 'mayorista', 'wholesale', 'restaurante', 'restaurant', 'evento', 'event', 'reclamo', 'complaint'])) {
    return es
      ? 'Claro, te paso con uno de nuestros carniceros por WhatsApp. Le llegará tu carrito y el resumen de esta conversación.\n[[whatsapp]]'
      : "Of course — I'll hand you over to one of our butchers on WhatsApp, with your cart and a summary of this chat.\n[[whatsapp]]"
  }
  if (has(q, ['qr', 'pago', 'pagar', 'pay', 'tigo', 'transfer', 'tarjeta', 'card', 'efectivo', 'cash'])) {
    return es
      ? 'Aceptamos **QR Simple** (desde la app de cualquier banco boliviano), Tigo Money, transferencia, tarjeta con link de pago seguro y efectivo o QR contra entrega. En el último paso del checkout verás el QR; luego envías el comprobante por WhatsApp y despachamos.\n[[checkout]]'
      : 'We accept **QR Simple** (from any Bolivian banking app), Tigo Money, bank transfer, card via secure payment link, and cash or QR on delivery. The QR appears in the last checkout step; send the receipt on WhatsApp and we dispatch.\n[[checkout]]'
  }
  if (people > 0 || has(q, ['parrillada', 'asado', 'cuanto', 'cuanta', 'how much', 'how many', 'cantidad'])) {
    const n = people || 6
    const kg = Math.ceil(n * 0.45 * 10) / 10
    return es
      ? `Para ${n} personas calcula unos **${kg} kg** de carne cruda en una parrillada clásica. Te propongo picaña, costilla banderita y un tomahawk para el momento estrella, más chorizo para arrancar.\n[[product:picana-wagyu]]\n[[product:costilla-angus]]\n[[product:tomahawk-wagyu]]`
      : `For ${n} people plan around **${kg} kg** of raw meat for a classic asado. I'd suggest picanha, short-rib strips and a tomahawk as the showpiece, plus chorizo to start.\n[[product:picana-wagyu]]\n[[product:costilla-angus]]\n[[product:tomahawk-wagyu]]`
  }
  if (has(q, ['bms', 'marmoleo', 'marbling', 'a5', 'wagyu'])) {
    return es
      ? 'El **BMS** mide el marmoleo de 1 a 12: más grasa intramuscular = más terneza y sabor mantecoso. Nuestro Ojo de Bife A5 es BMS 11; el Wagyu F1 boliviano va de 6 a 8. Prueba el laboratorio de marmoleo más arriba.\n[[product:ribeye-wagyu-a5]]'
      : '**BMS** grades marbling from 1 to 12: more intramuscular fat = more tenderness and buttery flavour. Our A5 Ribeye is BMS 11; Bolivian F1 Wagyu sits at 6–8. Try the marbling lab above.\n[[product:ribeye-wagyu-a5]]'
  }
  if (has(q, ['delivery', 'envio', 'entrega', 'zona', 'urubo', 'equipetrol', 'deliver'])) {
    const zones = SITE.delivery.filter((z) => z.fee > 0).map((z) => `${z.name} Bs. ${z.fee}`).join(' · ')
    return es
      ? `Entregamos en frío y al vacío en toda Santa Cruz: ${zones}. **Gratis desde Bs. ${SITE.freeDeliveryFrom}**. También puedes retirar en tienda.`
      : `We deliver cold and vacuum-sealed across Santa Cruz: ${zones}. **Free from Bs. ${SITE.freeDeliveryFrom}**. Store pickup is also available.`
  }
  if (has(q, ['horario', 'hora', 'abierto', 'hours', 'open', 'direccion', 'ubicacion', 'address', 'where'])) {
    return es ? `Estamos en ${SITE.address.line}. Horarios: ${SITE.hours.es.join(' · ')}.` : `We're in ${SITE.address.line}. Hours: ${SITE.hours.en.join(' · ')}.`
  }
  if (has(q, ['tierno', 'tender', 'lomo', 'tenderloin', 'romantic', 'romantica', 'cena', 'dinner'])) {
    return es
      ? 'Para una cena especial, el **Lomo Fino Wagyu** es el más tierno; si quieres impresionar, el **Ojo de Bife A5**.\n[[product:lomo-wagyu]]\n[[product:ribeye-wagyu-a5]]'
      : 'For a special dinner, the **Wagyu Tenderloin** is the most tender; to truly impress, the **A5 Ribeye**.\n[[product:lomo-wagyu]]\n[[product:ribeye-wagyu-a5]]'
  }
  if (has(q, ['comprar', 'checkout', 'finalizar', 'buy', 'order', 'pedido'])) {
    return es ? '¡Perfecto! Revisa tu carrito y finaliza en 3 pasos.\n[[checkout]]' : 'Perfect! Review your cart and check out in 3 steps.\n[[checkout]]'
  }
  return es
    ? 'Te ayudo encantado. ¿Es para una parrillada, una cena especial o quieres probar Wagyu por primera vez? Estos son los favoritos de la casa:\n[[product:picana-wagyu]]\n[[product:tomahawk-wagyu]]'
    : "Happy to help. Is it for an asado, a special dinner, or your first time trying Wagyu? Here are the house favourites:\n[[product:picana-wagyu]]\n[[product:tomahawk-wagyu]]"
}
