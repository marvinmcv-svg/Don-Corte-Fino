# Don Corte Fino — Wagyu Butchery · Santa Cruz, Bolivia

Premium landing page + online store for a Wagyu butchery in Santa Cruz de la Sierra.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS · GSAP + ScrollTrigger · Lenis smooth scroll · Framer Motion · Three.js (React Three Fiber) · Zustand · Claude API (AI concierge)

## Features

| Area | What it does |
| --- | --- |
| **Preloader** | GSAP counter and curtain reveal |
| **3D hero** | Real-time Three.js wagyu steak with a procedurally painted marbling texture, salt flakes, rising embers, mouse parallax and a scroll-driven camera. Rendering pauses once the hero is off-screen |
| **"Un viaje sin cortes"** | A scroll-world camera flight adapted from [oso95/scroll-world](https://github.com/oso95/scroll-world): the camera dives into each scene and flies out into the next with no cuts (Origin → Ageing → The Master → The Fire → Your Table) |
| **Marbling lab** | Interactive BMS 1–12 slider that re-renders the marbling live |
| **Signature cuts** | Pinned horizontal showcase |
| **Shop** | 14 cuts popular in Bolivia (picaña, costilla banderita, matambre, ojo de bife, tomahawk, lomo, entraña, T-bone…), category filters, variants, quick view |
| **Cart funnel** | Free-delivery progress bar, "complete your asado" upsells, header reveal on add, a concierge nudge when the visitor goes quiet with items in the cart |
| **Checkout** | Details → delivery zone/date/slot → payment → confirmation. The order summary opens in WhatsApp |
| **Payments** | **QR Simple** (works with any Bolivian bank app), Tigo Money, bank transfer (copy-to-clipboard details), card via payment link, cash/QR on delivery |
| **AI concierge** | Claude-powered receptionist that knows the catalogue, prices, delivery zones and payment methods. It recommends cuts as product cards you can add to the cart, works out quantities for an asado, sends you to checkout, and hands off to WhatsApp with the chat and cart summary. Without an API key it falls back to a scripted assistant |
| **Night / day mode** | Persisted theme with no flash on load |
| **ES / EN** | Full bilingual UI, persisted |
| **Polish** | Film grain, magnetic buttons, custom cursor, masked text reveals, `prefers-reduced-motion` support, mobile-first layouts |

## Quick start

```bash
npm install
cp .env.example .env      # add ANTHROPIC_API_KEY to enable the AI concierge
npm run dev               # http://localhost:5173
npm run build             # production build in dist/
```

## Before going live: edit `src/config/site.ts`

- `whatsapp`: your real WhatsApp number, digits only (e.g. `5917xxxxxxx`). **It is currently a placeholder.**
- `instagram`: your handle and profile URL.
- `address`, `hours`, `delivery` zones and fees, `freeDeliveryFrom`.
- `payments.qrImage`: export your bank's static **QR Simple** image, save it as `public/payments/qr-simple.png`, and set the path here. Until you do, checkout shows a QR that only encodes the order reference.
- `payments.bank`, `payments.tigoMoney`, `payments.cardLink` (e.g. a Libélula, PagosNet or Stripe payment link).

Products and prices live in `src/data/products.ts`. **The prices there are placeholders. Replace them with your real price list.** All UI copy is in `src/i18n/dict.ts`.

## Photos

The real Instagram photos couldn't be downloaded while the site was being built: the build environment's network blocks Instagram. Until photos are added, every image slot shows a procedurally rendered wagyu cut, so nothing looks broken. Add photos in either of these ways:

1. **Automatically**, on your own computer:
   ```bash
   ./scripts/fetch-instagram.sh <your_instagram_username>          # add "login" if Instagram asks
   ```
2. **By hand**: drop JPGs with these names:
   - `public/images/ig/01.jpg` … `08.jpg`: Instagram gallery wall
   - `public/images/journey/01-origen.jpg`, `02-maduracion.jpg`, `03-maestro.jpg`, `04-fuego.jpg`, `05-mesa.jpg`: the scroll journey scenes (landscape works best)
   - Product photos: put files in `public/images/cuts/` and set `image: '/images/cuts/<file>.jpg'` on a product in `src/data/products.ts`

Whenever one of these files exists, it automatically replaces the procedural art in that slot.

## AI concierge (Claude)

- Server code: `server/concierge.ts` (system prompt with the live catalogue and store info). It's served by `api/chat.ts` on Vercel and by a Vite middleware in development.
- Set `ANTHROPIC_API_KEY` in `.env` locally, or in your Vercel project's environment variables. The key stays on the server and never reaches the browser.
- Model: `claude-opus-5-5` by default, with low effort for fast replies. Override it with `ANTHROPIC_MODEL`. Server-side refusal fallbacks (`fallbacks: "default"`) are enabled.
- The model drives the UI with tokens: `[[product:<id>]]` renders a product card, `[[checkout]]` a checkout button, `[[whatsapp]]` the WhatsApp handoff.
- With no key, or if the API can't be reached, the scripted assistant in `src/components/concierge/localBrain.ts` takes over.

## Deploy (Vercel)

1. Import the repo in Vercel. It detects the Vite framework.
2. Add the environment variable `ANTHROPIC_API_KEY`.
3. Deploy. `api/chat.ts` becomes the `/api/chat` serverless function.

On other static hosts (Netlify, Cloudflare Pages…) the site works as-is with the scripted concierge. To use the AI concierge there, port `api/chat.ts` to that host's functions format.

## Project layout

```
api/chat.ts                 Vercel function → AI concierge
server/concierge.ts         Claude prompt + streaming (shared with dev server)
scripts/fetch-instagram.sh  Pull photos from Instagram into public/images
src/config/site.ts          ← business settings (WhatsApp, payments, delivery)
src/data/products.ts        ← catalogue and prices
src/data/media.ts           photo slots
src/i18n/dict.ts            Spanish / English copy
src/components/three/       Three.js steak + procedural marbling
src/components/sections/    Hero, Journey (scroll-world), Marbling lab, …
src/components/shop/        Product grid, cards, quick view
src/components/checkout/    Cart drawer + checkout funnel with QR
src/components/concierge/   AI receptionist UI + offline brain
```
