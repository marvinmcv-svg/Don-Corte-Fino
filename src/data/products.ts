import type { Lang } from '../i18n/dict'

export type CutShape =
  | 'ribeye'
  | 'strip'
  | 'tomahawk'
  | 'picanha'
  | 'tenderloin'
  | 'flank'
  | 'ribs'
  | 'brisket'
  | 'burger'
  | 'chorizo'
  | 'tbone'
  | 'skirt'

export type Category = 'wagyu' | 'parrilla' | 'especiales' | 'complementos'

export interface Variant {
  id: string
  label: string // e.g. "500 g"
  price: number // Bs.
}

export interface Product {
  id: string
  name: Record<Lang, string>
  /** Local Bolivian name shown as a subtitle (what people ask for at the counter) */
  local: string
  category: Category
  shape: CutShape
  /** Beef Marbling Standard 1–12. Drives the procedural marbling density. */
  bms: number
  origin: Record<Lang, string>
  desc: Record<Lang, string>
  pairing: Record<Lang, string>
  doneness: Record<Lang, string>
  variants: Variant[]
  badges?: Array<'bestseller' | 'new' | 'limited' | 'chef'>
  /** Optional real photo (drop files in /public/images/cuts). Falls back to procedural art. */
  image?: string
  featured?: boolean
}

// Prices are illustrative placeholders in Bolivianos — edit to match the real price list.
export const PRODUCTS: Product[] = [
  {
    id: 'ribeye-wagyu-a5',
    name: { es: 'Ojo de Bife Wagyu A5', en: 'Wagyu A5 Ribeye' },
    local: 'Ojo de bife',
    category: 'wagyu',
    shape: 'ribeye',
    bms: 11,
    origin: { es: 'Kagoshima, Japón', en: 'Kagoshima, Japan' },
    desc: {
      es: 'La joya de la casa. Marmoleo extremo que se funde a temperatura ambiente; sabor mantecoso y umami profundo.',
      en: 'The jewel of the house. Extreme marbling that melts at room temperature; buttery, deep umami.',
    },
    pairing: { es: 'Sal en escamas y un Malbec reserva', en: 'Flaky salt and a reserve Malbec' },
    doneness: { es: 'Sellado rápido · medio', en: 'Quick sear · medium' },
    variants: [
      { id: '200', label: '200 g', price: 690 },
      { id: '400', label: '400 g', price: 1320 },
    ],
    badges: ['limited', 'chef'],
    featured: true,
  },
  {
    id: 'tomahawk-wagyu',
    name: { es: 'Tomahawk Wagyu', en: 'Wagyu Tomahawk' },
    local: 'Tomahawk',
    category: 'wagyu',
    shape: 'tomahawk',
    bms: 8,
    origin: { es: 'Wagyu F1 · Beni, Bolivia', en: 'F1 Wagyu · Beni, Bolivia' },
    desc: {
      es: 'El protagonista de la parrilla. Hueso francés de 25 cm, 1,2 kg de pura ceremonia.',
      en: 'The star of the grill. Frenched 25 cm bone, 1.2 kg of pure ceremony.',
    },
    pairing: { es: 'Chimichurri de la casa y papas al rescoldo', en: 'House chimichurri and ember-roasted potatoes' },
    doneness: { es: 'Fuego indirecto · jugoso', en: 'Reverse sear · medium-rare' },
    variants: [{ id: '1200', label: '≈ 1,2 kg', price: 780 }],
    badges: ['bestseller'],
    featured: true,
  },
  {
    id: 'picana-wagyu',
    name: { es: 'Picaña Wagyu', en: 'Wagyu Picanha' },
    local: 'Picaña',
    category: 'wagyu',
    shape: 'picanha',
    bms: 7,
    origin: { es: 'Wagyu F1 · Santa Cruz', en: 'F1 Wagyu · Santa Cruz' },
    desc: {
      es: 'El corte favorito del cruceño, elevado. Capa de grasa dorada y carne con marmoleo fino.',
      en: "Santa Cruz's favourite cut, elevated. Golden fat cap over finely marbled meat.",
    },
    pairing: { es: 'Yuca frita y llajua', en: 'Fried cassava and llajua salsa' },
    doneness: { es: 'En espeto o en bife · punto', en: 'Skewered or as steaks · medium' },
    variants: [
      { id: '1000', label: '≈ 1 kg', price: 420 },
      { id: '1500', label: '≈ 1,5 kg', price: 615 },
    ],
    badges: ['bestseller'],
    featured: true,
  },
  {
    id: 'bife-chorizo-wagyu',
    name: { es: 'Bife de Chorizo Wagyu', en: 'Wagyu Striploin' },
    local: 'Bife de chorizo',
    category: 'wagyu',
    shape: 'strip',
    bms: 8,
    origin: { es: 'Wagyu F1 · Beni, Bolivia', en: 'F1 Wagyu · Beni, Bolivia' },
    desc: {
      es: 'Firme, jugoso y con borde de grasa crocante. Equilibrio perfecto entre mordida y terneza.',
      en: 'Firm, juicy, with a crisp fat edge. The perfect balance of bite and tenderness.',
    },
    pairing: { es: 'Manteca de hierbas y vegetales grillados', en: 'Herb butter and grilled vegetables' },
    doneness: { es: 'Fuego alto · jugoso', en: 'High heat · medium-rare' },
    variants: [
      { id: '350', label: '350 g', price: 245 },
      { id: '700', label: '2 × 350 g', price: 470 },
    ],
    featured: true,
  },
  {
    id: 'lomo-wagyu',
    name: { es: 'Lomo Fino Wagyu', en: 'Wagyu Tenderloin' },
    local: 'Lomo',
    category: 'wagyu',
    shape: 'tenderloin',
    bms: 7,
    origin: { es: 'Wagyu F1 · Beni, Bolivia', en: 'F1 Wagyu · Beni, Bolivia' },
    desc: {
      es: 'El corte más tierno del animal. Medallones que se cortan con tenedor.',
      en: 'The most tender cut of the animal. Medallions you can cut with a fork.',
    },
    pairing: { es: 'Reducción de vino tinto y puré trufado', en: 'Red-wine reduction and truffle mash' },
    doneness: { es: 'Sartén de hierro · jugoso', en: 'Cast iron · medium-rare' },
    variants: [
      { id: '250', label: '250 g', price: 230 },
      { id: '500', label: '500 g', price: 445 },
    ],
    badges: ['chef'],
  },
  {
    id: 'entrana-wagyu',
    name: { es: 'Entraña Wagyu', en: 'Wagyu Skirt Steak' },
    local: 'Entraña',
    category: 'wagyu',
    shape: 'skirt',
    bms: 6,
    origin: { es: 'Wagyu F1 · Santa Cruz', en: 'F1 Wagyu · Santa Cruz' },
    desc: {
      es: 'Fibra larga, sabor intenso y lista en minutos. El secreto de los parrilleros.',
      en: "Long grain, intense flavour, ready in minutes. The grill master's secret.",
    },
    pairing: { es: 'Salsa criolla y pan de arroz', en: 'Salsa criolla and cheese rice bread' },
    doneness: { es: 'Brasa fuerte · punto', en: 'Hot coals · medium' },
    variants: [{ id: '500', label: '≈ 500 g', price: 210 }],
    badges: ['new'],
  },
  {
    id: 'tbone-angus',
    name: { es: 'T-Bone Angus Madurado', en: 'Dry-Aged Angus T-Bone' },
    local: 'Chuleta T-Bone',
    category: 'parrilla',
    shape: 'tbone',
    bms: 4,
    origin: { es: 'Angus · 28 días dry-aged', en: 'Angus · 28-day dry-aged' },
    desc: {
      es: 'Dos cortes en uno: lomo y bife de chorizo unidos por el hueso. Madurado en nuestra cámara.',
      en: 'Two cuts in one: tenderloin and strip joined by the bone. Aged in our own chamber.',
    },
    pairing: { es: 'Sal gruesa y ensalada de rúcula', en: 'Coarse salt and rocket salad' },
    doneness: { es: 'Brasa media · jugoso', en: 'Medium coals · medium-rare' },
    variants: [{ id: '800', label: '≈ 800 g', price: 260 }],
    featured: true,
  },
  {
    id: 'costilla-angus',
    name: { es: 'Costilla Banderita', en: 'Short Rib Strip' },
    local: 'Costilla / asado de tira',
    category: 'parrilla',
    shape: 'ribs',
    bms: 4,
    origin: { es: 'Angus · Santa Cruz', en: 'Angus · Santa Cruz' },
    desc: {
      es: 'La reina del domingo cruceño. Corte transversal con hueso, grasa y mucho sabor.',
      en: 'Queen of the Santa Cruz Sunday asado. Cross-cut with bone, fat and plenty of flavour.',
    },
    pairing: { es: 'Arroz con queso y yuca', en: 'Cheesy rice and cassava' },
    doneness: { es: 'Fuego lento · bien cocido', en: 'Low and slow · well done' },
    variants: [
      { id: '1000', label: '1 kg', price: 145 },
      { id: '2000', label: '2 kg', price: 280 },
    ],
    badges: ['bestseller'],
  },
  {
    id: 'matambre-cerdo',
    name: { es: 'Matambre de Res', en: 'Beef Matambre (Flank)' },
    local: 'Matambre',
    category: 'parrilla',
    shape: 'flank',
    bms: 3,
    origin: { es: 'Angus · Santa Cruz', en: 'Angus · Santa Cruz' },
    desc: {
      es: 'Fino y sabroso, ideal a la pizza o arrollado. Un clásico de la parrilla criolla.',
      en: 'Thin and flavourful — perfect “a la pizza” or rolled. A criollo grill classic.',
    },
    pairing: { es: 'Salsa de tomate, queso y orégano', en: 'Tomato, cheese and oregano' },
    doneness: { es: 'Fuego medio · cocido', en: 'Medium heat · cooked through' },
    variants: [{ id: '1200', label: '≈ 1,2 kg', price: 150 }],
  },
  {
    id: 'brisket-wagyu',
    name: { es: 'Pecho Wagyu (Brisket)', en: 'Wagyu Brisket' },
    local: 'Pecho',
    category: 'especiales',
    shape: 'brisket',
    bms: 6,
    origin: { es: 'Wagyu F1 · Beni, Bolivia', en: 'F1 Wagyu · Beni, Bolivia' },
    desc: {
      es: 'Para ahumar 12 horas o para un majadito de domingo. Grasa intramuscular que no se seca.',
      en: 'For a 12-hour smoke or a Sunday majadito. Intramuscular fat that never dries out.',
    },
    pairing: { es: 'Rub de café y pan brioche', en: 'Coffee rub and brioche' },
    doneness: { es: 'Ahumado lento · 95 °C interno', en: 'Low smoke · 95 °C internal' },
    variants: [{ id: '3000', label: '≈ 3 kg', price: 690 }],
    badges: ['chef'],
  },
  {
    id: 'colita-cuadril',
    name: { es: 'Colita de Cuadril Angus', en: 'Angus Tri-Tip' },
    local: 'Colita de cuadril',
    category: 'especiales',
    shape: 'picanha',
    bms: 4,
    origin: { es: 'Angus · Santa Cruz', en: 'Angus · Santa Cruz' },
    desc: {
      es: 'Magra pero tierna, triangular y versátil. Excelente al horno o a la parrilla.',
      en: 'Lean yet tender, triangular and versatile. Excellent roasted or grilled.',
    },
    pairing: { es: 'Papas rústicas y chimichurri', en: 'Rustic potatoes and chimichurri' },
    doneness: { es: 'Horno o parrilla · punto', en: 'Oven or grill · medium' },
    variants: [{ id: '900', label: '≈ 900 g', price: 165 }],
  },
  {
    id: 'burger-wagyu',
    name: { es: 'Hamburguesas Wagyu', en: 'Wagyu Burger Patties' },
    local: 'Hamburguesa',
    category: 'especiales',
    shape: 'burger',
    bms: 6,
    origin: { es: 'Blend Wagyu 80/20', en: '80/20 Wagyu blend' },
    desc: {
      es: 'Blend de recortes nobles Wagyu, molido a diario. 4 unidades de 180 g.',
      en: 'Blend of noble Wagyu trimmings, ground daily. 4 × 180 g patties.',
    },
    pairing: { es: 'Queso cheddar añejo y cebolla caramelizada', en: 'Aged cheddar and caramelised onion' },
    doneness: { es: 'Plancha caliente · punto', en: 'Hot griddle · medium' },
    variants: [{ id: '4', label: '4 × 180 g', price: 155 }],
    badges: ['bestseller'],
  },
  {
    id: 'chorizo-parrillero',
    name: { es: 'Chorizo Parrillero Artesanal', en: 'Artisan Grill Sausage' },
    local: 'Chorizo',
    category: 'complementos',
    shape: 'chorizo',
    bms: 3,
    origin: { es: 'Receta de la casa', en: 'House recipe' },
    desc: {
      es: 'Res y cerdo con especias de la casa. El arranque obligatorio de toda parrillada.',
      en: 'Beef and pork with house spices. The mandatory opener of every asado.',
    },
    pairing: { es: 'Pan marraqueta y llajua', en: 'Crusty bread and llajua' },
    doneness: { es: 'Fuego medio · dorado', en: 'Medium heat · golden' },
    variants: [{ id: '6', label: '6 unid.', price: 65 }],
  },
  {
    id: 'kit-parrillero',
    name: { es: 'Kit Parrillero', en: 'Grill Kit' },
    local: 'Carbón + sal + chimichurri',
    category: 'complementos',
    shape: 'chorizo',
    bms: 1,
    origin: { es: 'Selección de la casa', en: 'House selection' },
    desc: {
      es: 'Carbón de quebracho 5 kg, sal parrillera ahumada y chimichurri de la casa.',
      en: '5 kg quebracho charcoal, smoked grill salt and house chimichurri.',
    },
    pairing: { es: 'Cualquier corte de la casa', en: 'Any cut in the house' },
    doneness: { es: '—', en: '—' },
    variants: [{ id: 'kit', label: 'Kit', price: 85 }],
    badges: ['new'],
  },
]

export const CATEGORIES: Array<{ id: Category | 'all'; label: Record<Lang, string> }> = [
  { id: 'all', label: { es: 'Todo', en: 'All' } },
  { id: 'wagyu', label: { es: 'Wagyu', en: 'Wagyu' } },
  { id: 'parrilla', label: { es: 'Parrilla clásica', en: 'Classic grill' } },
  { id: 'especiales', label: { es: 'Especiales', en: 'Specials' } },
  { id: 'complementos', label: { es: 'Complementos', en: 'Extras' } },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)

/** Items suggested in the cart to complete an asado (upsell). */
export const UPSELL_IDS = ['chorizo-parrillero', 'kit-parrillero', 'burger-wagyu']
