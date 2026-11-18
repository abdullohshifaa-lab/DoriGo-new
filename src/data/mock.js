// Realistic mock data for the prototype (Tashkent, Uzbekistan).
// Map coordinates are on a 0–100 grid; the user's location is USER_POS.

export const USER_POS = { x: 50, y: 58 }

export const pharmacies = [
  { id: 'p1', name: 'Oq Dori', address: 'Amir Temur ko‘chasi, 42', rating: 4.8, reviews: 312, distanceKm: 0.6, prep: 2, x: 56, y: 50, open: '24/7' },
  { id: 'p2', name: 'Shifo Plus', address: 'Mustaqillik ko‘chasi, 11', rating: 4.6, reviews: 198, distanceKm: 0.8, prep: 3, x: 38, y: 52, open: '08:00–23:00' },
  { id: 'p3', name: 'Salomatlik 24', address: 'Navoiy ko‘chasi, 87', rating: 4.9, reviews: 540, distanceKm: 1.2, prep: 2, x: 66, y: 68, open: '24/7' },
  { id: 'p4', name: 'Apteka Grand', address: 'Bobur ko‘chasi, 5', rating: 4.4, reviews: 121, distanceKm: 1.6, prep: 4, x: 30, y: 72, open: '09:00–22:00' },
  { id: 'p5', name: 'Dori-Darmon', address: 'Chilonzor, 9-kvartal', rating: 4.7, reviews: 267, distanceKm: 2.1, prep: 3, x: 74, y: 36, open: '24/7' },
  { id: 'p6', name: 'Zamon Farm', address: 'Yunusobod, 4-mavze', rating: 4.5, reviews: 154, distanceKm: 2.7, prep: 3, x: 22, y: 34, open: '08:00–00:00' },
]

// stock: pharmacyId -> price in so'm (null / missing = not available)
export const medicines = [
  {
    id: 'm1', name: 'Paratsetamol', aliases: ['paracetamol', 'парацетамол', 'panadol'], form: 'Tabletka 500 mg, 20 dona', maker: 'Nobel Pharma',
    rx: false, desc: 'Og‘riq qoldiruvchi va isitma tushiruvchi vosita. Qo‘llanma bo‘yicha ishlating.',
    stock: { p1: 8500, p2: 9000, p3: 8000, p5: 9500 }, alternatives: ['m2'],
  },
  {
    id: 'm2', name: 'Ibuprofen', aliases: ['ibuprofen', 'ибупрофен', 'nurofen'], form: 'Tabletka 400 mg, 20 dona', maker: 'Polpharma',
    rx: false, desc: 'Yallig‘lanishga qarshi va og‘riq qoldiruvchi vosita.',
    stock: { p1: 24000, p3: 22500, p4: 25000, p6: 23000 }, alternatives: ['m1'],
  },
  {
    id: 'm3', name: 'Aspirin Kardio', aliases: ['aspirin', 'аспирин'], form: 'Tabletka 100 mg, 28 dona', maker: 'Bayer',
    rx: false, desc: 'Shifokor tayinlagan hollarda qo‘llaniladi.',
    stock: { p2: 38000, p4: 36500, p5: 39000 }, alternatives: [],
  },
  {
    id: 'm4', name: 'Loratadin', aliases: ['loratadine', 'лоратадин', 'klaritin'], form: 'Tabletka 10 mg, 10 dona', maker: 'Zentiva',
    rx: false, desc: 'Allergiya alomatlarini yengillashtiradi.',
    stock: { p1: 14000, p3: 13500, p6: 15000 }, alternatives: [],
  },
  {
    id: 'm5', name: 'Smekta', aliases: ['smecta', 'смекта'], form: 'Poroshok, 10 paket', maker: 'Ipsen',
    rx: false, desc: 'Oshqozon-ichak noqulayliklarida qo‘llaniladi.',
    stock: { p2: 52000, p3: 49000 }, alternatives: [],
  },
  {
    id: 'm6', name: 'Nazivin', aliases: ['nazivin', 'називин'], form: 'Burun tomchisi 0.05%, 10 ml', maker: 'Merck',
    rx: false, desc: 'Burun bitishini vaqtincha kamaytiradi.',
    stock: { p1: 18000, p4: 17000, p5: 19500 }, alternatives: [],
  },
  {
    id: 'm7', name: 'Amoksitsillin', aliases: ['amoxicillin', 'амоксициллин'], form: 'Kapsula 500 mg, 16 dona', maker: 'Sandoz',
    rx: true, desc: 'Antibiotik. Faqat shifokor retsepti bilan beriladi.',
    stock: { p3: 41000 }, alternatives: [],
  },
  {
    id: 'm8', name: 'Aktivlangan ko‘mir', aliases: ['ugol', 'activated carbon', 'уголь', 'komir'], form: 'Tabletka 250 mg, 10 dona', maker: 'Uzfarm',
    rx: false, desc: 'Sorbent. Qo‘llanma bo‘yicha ishlating.',
    stock: { p1: 3500, p2: 3000, p3: 3200, p4: 3000, p5: 3500, p6: 2800 }, alternatives: [],
  },
  {
    id: 'm9', name: 'Insulin Aspart', aliases: ['insulin', 'инсулин'], form: 'Flakon 100 ED/ml, 10 ml', maker: 'Novo Nordisk',
    rx: true, desc: 'Retsept bo‘yicha. Sovuq saqlanadi — kuryer termo-sumkada olib keladi.',
    stock: { p5: 210000 }, alternatives: [],
  },
  {
    id: 'm10', name: 'Sitramon', aliases: ['citramon', 'цитрамон'], form: 'Tabletka, 10 dona', maker: 'Uzfarm',
    rx: false, desc: 'Hozir yaqin dorixonalarda yo‘q (demo: mavjud emas holati).',
    stock: {}, alternatives: ['m1', 'm2'],
  },
]

export const popularSearches = ['Paratsetamol', 'Ibuprofen', 'Loratadin', 'Smekta', 'Nazivin']

// ---------- helpers ----------
export function normalize(s) {
  return s.toLowerCase().replace(/[‘’`ʻ']/g, '').trim()
}

export function findMedicine(query, source = medicines) {
  const q = normalize(query)
  if (!q) return null
  const active = source.filter((m) => m.isActive !== false)
  return (
    active.find((m) => normalize(m.name) === q) ||
    active.find((m) => normalize(m.name).startsWith(q) || (m.aliases || []).some((a) => normalize(a).startsWith(q))) ||
    active.find((m) => normalize(m.name).includes(q) || (m.aliases || []).some((a) => normalize(a).includes(q))) ||
    null
  )
}

export function suggestMedicines(query, limit = 5, source = medicines) {
  const q = normalize(query)
  if (!q) return []
  return source.filter((m) => m.isActive !== false)
    .filter((m) => normalize(m.name).includes(q) || (m.aliases || []).some((a) => normalize(a).includes(q)))
    .slice(0, limit)
}

// Delivery ETA: pharmacy preparation + riding time. Urgent mode uses the faster courier pool.
export function etaRange(pharmacy, urgent = false) {
  const ride = Math.max(2, Math.round(pharmacy.distanceKm * 3.2))
  const low = pharmacy.prep + ride - (urgent ? 1 : 0)
  return { min: Math.max(3, low), max: Math.max(5, low + 3) }
}

export function deliveryFee(pharmacy, urgent = false) {
  const base = 8000 + Math.round(pharmacy.distanceKm * 4000)
  return urgent ? base + 6000 : base
}

// Returns pharmacies split into those that have the medicine and those that do not.
export function searchPharmacies(medicine, urgent = false) {
  const withStock = []
  const without = []
  for (const p of pharmacies) {
    const price = medicine.stock?.[p.id]
    const qtyAvailable = medicine.inventoryQty === undefined || Number(medicine.inventoryQty) > 0
    const available = Boolean(price) && qtyAvailable && medicine.isActive !== false
    const row = { pharmacy: p, price: available ? price : null, available, eta: etaRange(p, urgent), fee: deliveryFee(p, urgent) }
    ;(available ? withStock : without).push(row)
  }
  return { withStock, without }
}

export function sortRows(rows, by) {
  const copy = [...rows]
  if (by === 'close') copy.sort((a, b) => a.pharmacy.distanceKm - b.pharmacy.distanceKm)
  else if (by === 'cheap') copy.sort((a, b) => a.price - b.price)
  else copy.sort((a, b) => a.eta.min - b.eta.min || a.pharmacy.distanceKm - b.pharmacy.distanceKm)
  return copy
}

export const formatSom = (n) => new Intl.NumberFormat('en-US').format(n).replace(/,/g, ' ')

export const COURIERS = [
  { name: 'Jasur A.', vehicle: 'Velosiped', rating: 4.9, phone: '+998 90 123 45 67' },
  { name: 'Bekzod R.', vehicle: 'Skuter', rating: 4.8, phone: '+998 91 234 56 78' },
  { name: 'Sardor T.', vehicle: 'Skuter', rating: 4.9, phone: '+998 93 345 67 89' },
]

export const seedOrders = [
  {
    id: 'DG-48210', createdAt: Date.now() - 1000 * 60 * 60 * 26, status: 4, medicineId: 'm1', pharmacyId: 'p1', qty: 1,
    price: 8500, fee: 12400, total: 20900, address: 'Amir Temur ko‘chasi, 18', name: 'Dilshod Karimov', phone: '+998 90 111 22 33', urgent: false,
    courier: COURIERS[0], etaMin: 6,
  },
  {
    id: 'DG-47993', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, status: 4, medicineId: 'm4', pharmacyId: 'p3', qty: 1,
    price: 13500, fee: 18000, total: 31500, address: 'Amir Temur ko‘chasi, 18', name: 'Dilshod Karimov', phone: '+998 90 111 22 33', urgent: true,
    courier: COURIERS[1], etaMin: 7,
  },
]
