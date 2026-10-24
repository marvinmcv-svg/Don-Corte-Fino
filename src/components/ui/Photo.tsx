import { useEffect, useState, type ReactNode } from 'react'

const cache = new Map<string, boolean>()

/** Resolves whether an image URL actually loads (cached per URL). */
export function useImageExists(src?: string) {
  const [ok, setOk] = useState<boolean | null>(src ? (cache.get(src) ?? null) : false)
  useEffect(() => {
    if (!src) return setOk(false)
    if (cache.has(src)) return setOk(cache.get(src)!)
    const img = new Image()
    img.onload = () => (cache.set(src, true), setOk(true))
    img.onerror = () => (cache.set(src, false), setOk(false))
    img.src = src
  }, [src])
  return ok
}

interface Props {
  src?: string
  alt: string
  className?: string
  imgClassName?: string
  fallback: ReactNode
}

/** Real photo when it exists, otherwise the procedural fallback — never a broken image. */
export function Photo({ src, alt, className, imgClassName, fallback }: Props) {
  const ok = useImageExists(src)
  return (
    <div className={className}>
      {ok ? <img src={src} alt={alt} loading="lazy" decoding="async" className={imgClassName ?? 'h-full w-full object-cover'} /> : fallback}
    </div>
  )
}
