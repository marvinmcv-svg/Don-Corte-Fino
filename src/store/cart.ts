import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { productById } from '../data/products'

export interface CartLine {
  productId: string
  variantId: string
  qty: number
}

interface CartState {
  lines: CartLine[]
  lastAddedAt: number
  add: (productId: string, variantId: string, qty?: number) => void
  setQty: (productId: string, variantId: string, qty: number) => void
  remove: (productId: string, variantId: string) => void
  clear: () => void
}

const same = (l: CartLine, p: string, v: string) => l.productId === p && l.variantId === v

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      lastAddedAt: 0,
      add: (productId, variantId, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => same(l, productId, variantId))
          const lines = existing
            ? s.lines.map((l) => (same(l, productId, variantId) ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { productId, variantId, qty }]
          return { lines, lastAddedAt: Date.now() }
        }),
      setQty: (productId, variantId, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => !same(l, productId, variantId)) : s.lines.map((l) => (same(l, productId, variantId) ? { ...l, qty } : l)),
        })),
      remove: (productId, variantId) => set((s) => ({ lines: s.lines.filter((l) => !same(l, productId, variantId)) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'dcf-cart', partialize: (s) => ({ lines: s.lines }) },
  ),
)

export interface ResolvedLine extends CartLine {
  name: { es: string; en: string }
  variantLabel: string
  unitPrice: number
  total: number
}

export const resolveLines = (lines: CartLine[]): ResolvedLine[] =>
  lines.flatMap((l) => {
    const p = productById(l.productId)
    const v = p?.variants.find((x) => x.id === l.variantId)
    if (!p || !v) return []
    return [{ ...l, name: p.name, variantLabel: v.label, unitPrice: v.price, total: v.price * l.qty }]
  })

export const useCartSummary = () => {
  const lines = useCart((s) => s.lines)
  const resolved = resolveLines(lines)
  const subtotal = resolved.reduce((a, l) => a + l.total, 0)
  const count = resolved.reduce((a, l) => a + l.qty, 0)
  return { lines: resolved, subtotal, count }
}
