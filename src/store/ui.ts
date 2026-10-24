import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DICTS, type Lang } from '../i18n/dict'

type Theme = 'dark' | 'light'

interface UIState {
  lang: Lang
  theme: Theme
  cartOpen: boolean
  checkoutOpen: boolean
  conciergeOpen: boolean
  quickView: string | null
  setLang: (l: Lang) => void
  toggleLang: () => void
  toggleTheme: () => void
  setCartOpen: (v: boolean) => void
  setCheckoutOpen: (v: boolean) => void
  setConciergeOpen: (v: boolean) => void
  setQuickView: (id: string | null) => void
}

const applyTheme = (t: Theme) => {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0b0908' : '#f4ede3')
}

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      lang: 'es',
      theme: 'dark',
      cartOpen: false,
      checkoutOpen: false,
      conciergeOpen: false,
      quickView: null,
      setLang: (lang) => {
        document.documentElement.lang = lang
        set({ lang })
      },
      toggleLang: () => get().setLang(get().lang === 'es' ? 'en' : 'es'),
      toggleTheme: () => {
        const theme = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(theme)
        set({ theme })
      },
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen, cartOpen: false }),
      setConciergeOpen: (conciergeOpen) => set({ conciergeOpen }),
      setQuickView: (quickView) => set({ quickView }),
    }),
    {
      name: 'dcf-ui',
      partialize: (s) => ({ lang: s.lang, theme: s.theme }),
      onRehydrateStorage: () => (s) => s && applyTheme(s.theme),
    },
  ),
)

/** Current dictionary + language. */
export const useT = () => {
  const lang = useUI((s) => s.lang)
  return { t: DICTS[lang], lang }
}
