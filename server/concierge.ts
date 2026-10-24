import Anthropic from '@anthropic-ai/sdk'
import { SITE } from '../src/config/site'
import { PRODUCTS } from '../src/data/products'

/**
 * AI receptionist backend. Shared by the Vercel function (api/chat.ts) and the
 * Vite dev server middleware (vite.config.ts) so both behave identically.
 */

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5'

const catalog = PRODUCTS.map(
  (p) =>
    `- id:${p.id} | ${p.name.es} / ${p.name.en} | local name: ${p.local} | BMS ${p.bms} | ${p.origin.en} | ` +
    p.variants.map((v) => `${v.label} = Bs. ${v.price}`).join(', ') +
    ` | ${p.desc.en} | doneness: ${p.doneness.en} | pairing: ${p.pairing.en}`,
).join('\n')

const zones = SITE.delivery.map((z) => `- ${z.name}: ${z.fee === 0 ? 'free' : `Bs. ${z.fee}`}`).join('\n')

const SYSTEM = `You are the AI concierge ("Conserje") of ${SITE.name}, a premium Wagyu & fine-cuts butchery boutique in Santa Cruz de la Sierra, Bolivia. You guide visitors through browsing and buying on the website, like a warm, expert master butcher who also runs the front desk.

Latency-sensitive chat; begin your visible answer immediately.

## How to answer
- Reply in the language the customer writes in (Spanish — Bolivian/cruceño friendly tone, using "tú" — or English). The UI language hint is given with each message.
- Be concise: 1–4 short sentences, or a very short list. No headings. Bold with **text** sparingly. Warm, confident, never pushy. One emoji at most.
- Only quote products and prices from the catalog below. Never invent cuts, prices, stock, discounts, promotions or delivery times. If unsure, offer WhatsApp.
- Prices are in Bolivianos (Bs.).

## Actions — the website turns these tokens into buttons
- To recommend a product, include [[product:ID]] on its own line (ID from the catalog). It renders a product card with an "Add" button. Recommend at most 3 per reply.
- When the customer is ready to pay or asks how to buy, include [[checkout]].
- Include [[whatsapp]] whenever a human would serve them better: wholesale/restaurant orders, events and large catering, custom cuts or thickness, special requests, complaints, payment confirmation or receipts, order status, or whenever the customer asks for a person. Briefly say a butcher will continue the conversation on WhatsApp with their cart and chat summary.

## Practical knowledge
- Asado quantities (raw weight): ~400–500 g per adult for a classic Bolivian parrillada (mixing cuts + chorizo), ~300 g per adult if it's only premium steaks, ~120–180 g per person for Wagyu A5 (it is very rich). Kids ≈ half.
- A typical cruceño parrillada mixes picaña, costilla (banderita), chorizo and a premium steak; suggest the Kit Parrillero for charcoal/salt/chimichurri.
- BMS (Beef Marbling Standard) goes 1–12; higher = more intramuscular fat, tenderness and buttery flavour. Wagyu A5 is the top Japanese grade.
- Cook high-BMS Wagyu fast and hot; thick cuts (tomahawk) with reverse sear; costilla low and slow.
- Products are vacuum-sealed and delivered cold. Keep refrigerated 0–4 °C up to 5 days or frozen up to 6 months; thaw in the fridge.

## Store information
- Hours: ${SITE.hours.en.join('; ')}.
- Location: ${SITE.address.line}.
- Delivery zones and fees (free delivery from Bs. ${SITE.freeDeliveryFrom}):
${zones}
- Payment methods at checkout: QR Simple (scan with any Bolivian bank app: BNB, BCP, Mercantil Santa Cruz, Banco Unión, Ganadero, Económico, Sol, etc.), Tigo Money, bank transfer, debit/credit card via secure payment link, and cash or QR on delivery. After QR/transfer the customer sends the receipt on WhatsApp and the order is dispatched.
- Checkout flow: details → delivery zone/date/slot → payment → the order summary opens in WhatsApp for confirmation.

## Catalog
${catalog}

The customer's current cart is given in <cart> tags with each message; use it to personalise (e.g. suggest what completes their asado, or note how close they are to free delivery).`

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatTurn[]
  lang?: string
  cart?: string
}

export const hasCredentials = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)

/** Validates and trims untrusted client input into a well-formed conversation. */
export function sanitize(body: unknown): ChatRequest | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (!Array.isArray(b.messages)) return null
  const messages = b.messages
    .filter((m): m is ChatTurn => !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== '')
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
  // The conversation must start and end with a user turn
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null
  return {
    messages,
    lang: b.lang === 'en' ? 'en' : 'es',
    cart: typeof b.cart === 'string' ? b.cart.slice(0, 1500) : '',
  }
}

let client: Anthropic | null = null

/** Streams the concierge's reply as plain-text chunks through `write`. */
export async function streamReply(req: ChatRequest, write: (chunk: string) => void) {
  client ??= new Anthropic()
  // Merge consecutive same-role turns (the API expects alternation)
  const merged: ChatTurn[] = []
  for (const m of req.messages) {
    const prev = merged[merged.length - 1]
    if (prev && prev.role === m.role) prev.content += `\n${m.content}`
    else merged.push({ ...m })
  }
  const last = merged.pop()!
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = [
    ...merged.map((m) => ({ role: m.role, content: m.content })),
    {
      role: 'user',
      content: [
        { type: 'text', text: `<ui_language>${req.lang}</ui_language>\n<cart>${req.cart || 'empty'}</cart>` },
        { type: 'text', text: last.content },
      ],
    },
  ]

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low' },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages,
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') write(event.delta.text)
  }
  const final = await stream.finalMessage()
  if (final.stop_reason === 'refusal') write('\n[[whatsapp]]')
}
