import * as THREE from 'three'

// Small value-noise fBm — enough to paint convincing marbling on a canvas.
function makeNoise(seed: number) {
  const perm = new Uint8Array(512)
  const p = Array.from({ length: 256 }, (_, i) => i)
  let s = seed
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[p[i], p[j]] = [p[j], p[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  const grad = (h: number) => (h / 255) * 2 - 1
  const fade = (t: number) => t * t * (3 - 2 * t)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x) & 255
    const yi = Math.floor(y) & 255
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const a = grad(perm[perm[xi] + yi])
    const b = grad(perm[perm[xi + 1] + yi])
    const c = grad(perm[perm[xi] + yi + 1])
    const d = grad(perm[perm[xi + 1] + yi + 1])
    const u = fade(xf)
    const v = fade(yf)
    return lerp(lerp(a, b, u), lerp(c, d, u), v)
  }
  return (x: number, y: number, oct = 5) => {
    let amp = 0.5
    let f = 1
    let sum = 0
    for (let o = 0; o < oct; o++) {
      sum += amp * noise(x * f, y * f)
      f *= 2.03
      amp *= 0.5
    }
    return sum
  }
}

/**
 * Paints a wagyu cross-section: deep red muscle, cream fat veins (contour band of
 * warped noise) and fat flecks. `bms` (1–12) controls how much fat shows.
 */
export function createMarbleTexture(bms = 10, size = 1024, seed = 7) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const fbm = makeNoise(seed)
  const band = 0.014 + bms * 0.0042
  const fleck = 0.5 - bms * 0.016
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      // domain warp for organic, flowing veins
      const wx = fbm(u * 3 + 11, v * 3, 3) * 1.4
      const wy = fbm(u * 3, v * 3 + 7, 3) * 1.4
      const n = fbm(u * 4 + wx, v * 6 + wy)
      const f = fbm(u * 18 + 3, v * 18 + 9, 3)
      const vein = Math.max(0, 1 - Math.abs(n) / band) ** 0.6
      const spot = f > fleck ? Math.min(1, (f - fleck) * 12) : 0
      const fat = Math.min(1, vein + spot)
      // muscle colour with subtle variation
      const shade = 0.82 + fbm(u * 2, v * 2, 2) * 0.35
      const r = 150 * shade
      const g = 28 * shade
      const b = 30 * shade
      const i = (y * size + x) * 4
      img.data[i] = r + (246 - r) * fat
      img.data[i + 1] = g + (232 - g) * fat
      img.data[i + 2] = b + (214 - b) * fat
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/** Seared, caramelised crust for the sides of the steak. */
export function createCrustTexture(size = 512, seed = 3) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const fbm = makeNoise(seed)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x / size) * 10, (y / size) * 10) * 0.5 + 0.5
      const i = (y * size + x) * 4
      img.data[i] = 70 + n * 70
      img.data[i + 1] = 28 + n * 30
      img.data[i + 2] = 16 + n * 14
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
