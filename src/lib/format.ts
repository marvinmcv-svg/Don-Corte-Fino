import { SITE } from '../config/site'

export const money = (n: number) => `${SITE.currency} ${n.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`

export const orderRef = () => {
  const d = new Date()
  const pad = (x: number) => String(x).padStart(2, '0')
  return `DCF-${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

/** Tiny seeded PRNG so procedural art is stable between renders. */
export const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

export const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return Math.abs(h) || 1
}
