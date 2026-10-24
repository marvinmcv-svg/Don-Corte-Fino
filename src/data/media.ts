/**
 * Photo manifest. Drop the real Instagram photos into /public/images with these
 * file names (see scripts/fetch-instagram.sh). Any file that is missing falls back
 * to procedural art automatically, so the site never shows a broken image.
 */
import type { CutShape } from './products'

export interface MediaSlot {
  src: string
  /** Fallback art used until the real photo exists */
  shape: CutShape
  bms: number
}

export const JOURNEY_PHOTOS: MediaSlot[] = [
  { src: '/images/journey/01-origen.jpg', shape: 'brisket', bms: 5 },
  { src: '/images/journey/02-maduracion.jpg', shape: 'tbone', bms: 6 },
  { src: '/images/journey/03-maestro.jpg', shape: 'ribeye', bms: 9 },
  { src: '/images/journey/04-fuego.jpg', shape: 'tomahawk', bms: 8 },
  { src: '/images/journey/05-mesa.jpg', shape: 'strip', bms: 10 },
]

export const GALLERY: MediaSlot[] = [
  { src: '/images/ig/01.jpg', shape: 'ribeye', bms: 11 },
  { src: '/images/ig/02.jpg', shape: 'tomahawk', bms: 8 },
  { src: '/images/ig/03.jpg', shape: 'picanha', bms: 7 },
  { src: '/images/ig/04.jpg', shape: 'tbone', bms: 4 },
  { src: '/images/ig/05.jpg', shape: 'strip', bms: 9 },
  { src: '/images/ig/06.jpg', shape: 'ribs', bms: 5 },
  { src: '/images/ig/07.jpg', shape: 'tenderloin', bms: 7 },
  { src: '/images/ig/08.jpg', shape: 'burger', bms: 6 },
]
