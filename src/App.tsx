import { useCallback, useEffect, useState } from 'react'
import { CartDrawer } from './components/checkout/CartDrawer'
import { Checkout } from './components/checkout/Checkout'
import { Concierge } from './components/concierge/Concierge'
import { Footer } from './components/sections/Footer'
import { Gallery } from './components/sections/Gallery'
import { Hero } from './components/sections/Hero'
import { Journey } from './components/sections/Journey'
import { MarblingLab } from './components/sections/MarblingLab'
import { Marquee } from './components/sections/Marquee'
import { Nav } from './components/sections/Nav'
import { Preloader } from './components/sections/Preloader'
import { SignatureCuts } from './components/sections/SignatureCuts'
import { Testimonials } from './components/sections/Testimonials'
import { Visit } from './components/sections/Visit'
import { QuickView } from './components/shop/QuickView'
import { Shop } from './components/shop/Shop'
import { Cursor } from './components/ui/Cursor'
import { initSmoothScroll, ScrollTrigger } from './lib/motion'
import { useUI } from './store/ui'

export default function App() {
  const [ready, setReady] = useState(false)
  const lang = useUI((s) => s.lang)
  const onDone = useCallback(() => setReady(true), [])

  useEffect(() => {
    initSmoothScroll()
  }, [])

  // Text length changes with the language → pinned sections need fresh measurements
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => clearTimeout(id)
  }, [lang])

  return (
    <div className="grain">
      <Preloader onDone={onDone} />
      <Cursor />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Journey />
        <MarblingLab />
        <SignatureCuts />
        <Shop />
        <Gallery />
        <Testimonials />
        <Visit />
      </main>
      <Footer />
      <CartDrawer />
      <Checkout />
      <QuickView />
      <Concierge />
    </div>
  )
}
