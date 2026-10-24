import { useId, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react'
import type { CutShape } from '../../data/products'
import { hash } from '../../lib/format'

/**
 * Procedural, resolution-independent render of a raw cut with real-looking marbling.
 * Marbling = fractal noise → a narrow alpha band (veins) + a high threshold (flecks).
 * The BMS grade widens the band and lowers the threshold, so A5 looks visibly richer.
 * Used as the fallback whenever a real photo isn't available.
 */

interface Props {
  shape: CutShape
  bms: number
  seed?: string
  className?: string
  /** Adds a seared crust, as if just off the grill */
  seared?: boolean
}

// Main muscle silhouettes in a 400×300 box
const MEAT: Record<CutShape, string> = {
  ribeye:
    'M92 158c-6-48 30-92 88-104 52-11 112 2 138 40 24 35 14 86-22 113-38 29-105 38-152 26-34-9-48-40-52-75z',
  strip: 'M58 118c6-24 26-38 56-40l200-6c22 0 34 14 34 34l-4 88c-2 22-18 34-40 34l-196 4c-30 0-50-18-52-44z',
  tomahawk: 'M40 160c-6-46 24-86 74-96 44-9 92 4 112 38 18 32 10 76-20 100-32 26-88 32-126 22-26-8-36-36-40-64z',
  picanha: 'M44 210c30-64 92-118 168-140 46-13 104-8 140 14 14 9 10 26-4 30-30 10-48 40-66 70-24 40-70 66-130 66-58 0-118-10-108-40z',
  tenderloin: 'M40 150c0-34 40-58 100-62l170-6c34 0 56 26 54 62s-26 64-60 64l-166-2c-58-2-98-24-98-56z',
  flank: 'M36 104c40-20 120-30 200-26 60 3 110 14 132 30 10 30 6 74-6 100-50 18-130 24-206 18-58-4-100-16-118-28-12-30-12-66-2-94z',
  ribs: 'M30 112c0-14 12-24 26-24h288c14 0 26 10 26 24v76c0 14-12 24-26 24H56c-14 0-26-10-26-24z',
  brisket: 'M34 120c4-28 26-44 60-46l232-4c26 0 42 16 42 40l-6 100c-2 24-20 36-46 36l-232 2c-32 0-52-18-52-46z',
  burger: 'M200 66c74 0 128 36 128 84s-54 84-128 84-128-36-128-84 54-84 128-84z',
  chorizo:
    'M40 170c0-20 16-34 36-34 16 0 26 8 36 8s20-8 36-8 26 8 36 8 20-8 36-8 26 8 36 8 20-8 36-8c20 0 36 14 36 34s-16 34-36 34c-16 0-26-8-36-8s-20 8-36 8-26-8-36-8-20 8-36 8-26-8-36-8-20 8-36 8c-20 0-36-14-36-34z',
  tbone: 'M46 150c-4-50 30-88 82-98 40-8 70 6 78 34v130c-14 26-50 38-90 32-42-8-66-46-70-98zM214 70c40-16 98-12 128 18 26 26 26 76-2 106-28 28-80 36-126 26z',
  skirt: 'M28 150c30-40 70-56 116-50 40 6 66 30 104 30 40 0 70-26 104-22 22 3 24 28 8 44-34 34-74 54-118 52-40-2-64-24-100-24-36 0-66 20-96 14-22-4-28-26-18-44z',
}

// Fat caps / seams drawn on top of the meat
const FAT: Partial<Record<CutShape, string>> = {
  ribeye: 'M186 58c-30 22-44 58-36 96 6 30 30 54 64 62',
  strip: 'M60 112c4-22 24-32 54-34l200-6c22 0 32 12 34 30',
  picanha: 'M60 200c34-58 90-104 158-124 44-13 98-8 130 12',
  brisket: 'M36 128c4-28 26-46 60-48l232-4c26 0 40 16 40 38',
  ribs: 'M30 150h340',
  tomahawk: 'M120 70c-24 24-32 58-22 90 8 26 30 44 58 50',
}

// Bones
const BONE: Partial<Record<CutShape, string>> = {
  tomahawk: 'M222 124c40-6 90-12 140-14 10 0 16 6 16 14s-6 14-16 14c-50 0-100 6-138 14z',
  tbone: 'M196 52h22v196h-22z M150 140h70v20h-70z',
}

const RIB_BONES = [90, 200, 310]

function bandTable(bms: number) {
  // Width of the "vein" band around the mid value of the noise
  const w = 0.006 + bms * 0.0029
  const N = 48
  return Array.from({ length: N }, (_, i) => {
    const v = i / (N - 1)
    return Math.abs(v - 0.5) < w ? 1 : 0
  }).join(' ')
}

// Rasterised results, shared by every instance with the same parameters
const rasterCache = new Map<string, string>()

async function rasterize(svg: SVGSVGElement): Promise<string> {
  const markup = new XMLSerializer().serializeToString(svg)
  const svgUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    img.src = svgUrl
    await img.decode()
    const c = document.createElement('canvas')
    c.width = 800
    c.height = 600
    c.getContext('2d')!.drawImage(img, 0, 0, 800, 600)
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
    if (!blob) return svgUrl
    URL.revokeObjectURL(svgUrl)
    return URL.createObjectURL(blob)
  } catch {
    return svgUrl // canvas unavailable/tainted: the SVG image still caches its raster
  }
}

/**
 * The SVG filters (feTurbulence) are expensive to repaint, so each unique cut is drawn
 * once, rasterised to a PNG and from then on displayed as a plain <img>. This keeps the
 * scroll animations smooth even with dozens of cuts on screen.
 */
export function CutArt(props: Props) {
  const key = `${props.shape}|${props.bms}|${props.seed ?? props.shape}|${props.seared ? 1 : 0}`
  const [src, setSrc] = useState(() => rasterCache.get(key))
  const ref = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const cached = rasterCache.get(key)
    if (cached) return setSrc(cached)
    let alive = true
    rasterize(ref.current!).then((url) => {
      rasterCache.set(key, url)
      if (alive) setSrc(url)
    })
    return () => {
      alive = false
    }
  }, [key])

  if (src) return <img src={src} alt="" aria-hidden="true" draggable={false} className={`object-contain ${props.className ?? ''}`} />
  return <CutArtSvg {...props} svgRef={ref} />
}

function CutArtSvg({ shape, bms, seed = shape, className, seared, svgRef }: Props & { svgRef: Ref<SVGSVGElement> }) {
  const uid = useId().replace(/:/g, '')
  const s = useMemo(() => hash(seed) % 999, [seed])
  const fleckThreshold = 0.8 - bms * 0.012
  const meat = MEAT[shape]
  const isLink = shape === 'chorizo'

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`m${uid}`} cx="45%" cy="40%" r="70%">
          <stop offset="0%" stopColor={isLink ? '#a8432c' : '#b8352b'} />
          <stop offset="55%" stopColor={isLink ? '#7e2a1b' : '#8f1f1d'} />
          <stop offset="100%" stopColor={isLink ? '#4d170e' : '#4f0c0d'} />
        </radialGradient>
        <linearGradient id={`f${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf3e4" />
          <stop offset="100%" stopColor="#e6d3b5" />
        </linearGradient>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6efe2" />
          <stop offset="100%" stopColor="#cdbb9c" />
        </linearGradient>
        <radialGradient id={`g${uid}`} cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`v${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="5" seed={s} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.98  0 0 0 0 0.94  0 0 0 0 0.86  1 0 0 0 0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues={bandTable(bms)} />
          </feComponentTransfer>
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <filter id={`k${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed={s + 7} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.98  0 0 0 0 0.95  0 0 0 0 0.88  1 0 0 0 0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="14" intercept={-14 * fleckThreshold} />
          </feComponentTransfer>
        </filter>
        <filter id={`s${uid}`}>
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`d${uid}`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <clipPath id={`c${uid}`}>
          <path d={meat} />
        </clipPath>
      </defs>

      <g filter={`url(#d${uid})`}>
        {BONE[shape] && shape === 'tomahawk' && <path d={BONE[shape]} fill={`url(#b${uid})`} />}
        <path d={meat} fill={`url(#m${uid})`} />
        <g clipPath={`url(#c${uid})`}>
          {bms > 1 && <rect width="400" height="300" filter={`url(#v${uid})`} opacity={0.55 + bms * 0.035} />}
          {bms > 2 && <rect width="400" height="300" filter={`url(#k${uid})`} opacity={0.9} />}
          {(shape === 'flank' || shape === 'skirt') &&
            Array.from({ length: 22 }, (_, i) => (
              <line key={i} x1={i * 22 - 40} y1="40" x2={i * 22 + 40} y2="270" stroke="#3a0808" strokeOpacity="0.25" strokeWidth="1.4" />
            ))}
          {FAT[shape] && (
            <path d={FAT[shape]} fill="none" stroke={`url(#f${uid})`} strokeWidth={shape === 'picanha' || shape === 'brisket' ? 20 : 9} strokeLinecap="round" />
          )}
          {shape === 'ribs' &&
            RIB_BONES.map((x) => (
              <g key={x}>
                <ellipse cx={x} cy="150" rx="26" ry="20" fill={`url(#b${uid})`} />
                <ellipse cx={x} cy="150" rx="12" ry="8" fill="#b27e5c" opacity="0.6" />
              </g>
            ))}
          {shape === 'burger' && <circle cx="200" cy="150" r="62" fill="none" stroke="#2b0505" strokeOpacity="0.15" strokeWidth="30" />}
          {seared && <path d={meat} fill="none" stroke="#2a1006" strokeWidth="26" filter={`url(#s${uid})`} opacity="0.85" />}
          {/* inner edge shadow for depth */}
          <path d={meat} fill="none" stroke="#1d0303" strokeWidth="14" opacity="0.35" filter={`url(#s${uid})`} />
          <rect width="400" height="300" fill={`url(#g${uid})`} />
        </g>
        {shape === 'tbone' && BONE.tbone && <path d={BONE.tbone} fill={`url(#b${uid})`} />}
      </g>
    </svg>
  )
}
