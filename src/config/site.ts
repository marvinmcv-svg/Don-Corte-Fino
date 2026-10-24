/**
 * Business configuration — edit these values before going live.
 * Everything customer-facing that is specific to the shop lives here.
 */
export const SITE = {
  name: 'Don Corte Fino',
  tagline: { es: 'Wagyu Butchery · Santa Cruz', en: 'Wagyu Butchery · Santa Cruz' },

  /** WhatsApp number in international format, digits only (591 = Bolivia). REPLACE with the real number. */
  whatsapp: '59170000000',

  instagram: {
    handle: '@doncortefino',
    url: 'https://www.instagram.com/p/DR2g9NaDiio/',
  },

  address: {
    line: 'Santa Cruz de la Sierra, Bolivia',
    mapsUrl: 'https://maps.google.com/?q=Santa+Cruz+de+la+Sierra',
  },

  hours: {
    es: ['Lun – Sáb · 09:00 – 20:00', 'Dom · 09:00 – 14:00'],
    en: ['Mon – Sat · 9am – 8pm', 'Sun · 9am – 2pm'],
  },

  currency: 'Bs.',

  /** Orders at or above this subtotal get free delivery. */
  freeDeliveryFrom: 900,

  delivery: [
    { id: 'equipetrol', name: 'Equipetrol / Las Palmas', fee: 20 },
    { id: 'norte', name: 'Zona Norte (3er – 8vo anillo)', fee: 25 },
    { id: 'centro', name: 'Centro / Casco Viejo', fee: 20 },
    { id: 'urubo', name: 'Urubó / Colinas', fee: 45 },
    { id: 'sur', name: 'Zona Sur / Este', fee: 30 },
    { id: 'pickup', name: 'Retiro en tienda', fee: 0 },
  ],

  payments: {
    /**
     * Optional: path to your bank's static QR Simple image (e.g. /payments/qr-simple.png).
     * When empty, the checkout renders a QR containing the order reference instead.
     */
    qrImage: '',
    bank: {
      name: 'Banco (configurar)',
      holder: 'Don Corte Fino S.R.L.',
      account: '000-0000000',
      nit: '0000000000',
    },
    tigoMoney: '70000000',
    /** Optional hosted card-payment link (e.g. Libélula, Pagosnet, Stripe Payment Link). */
    cardLink: '',
  },
} as const

export type DeliveryZone = (typeof SITE.delivery)[number]
