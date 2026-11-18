import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getDict } from '../i18n/index.js'
import { COURIERS, medicines as initialMedicines, pharmacies, seedOrders } from '../data/mock.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage may be unavailable */ }
}
const defaultCatalog = initialMedicines.map((m) => ({
  ...m,
  unitPrice: Number(Object.values(m.stock || {}).find(Boolean) || 0),
  inventoryQty: ({ m1: 8, m2: 12, m3: 5, m4: 16, m5: 4, m6: 9, m7: 6, m8: 20, m9: 3, m10: 0 })[m.id] ?? 10,
  isActive: true,
}))
const stageLabels = {
  new: 'Yangi buyurtma', accepted: 'Dorixona buyurtmani qabul qildi', preparing: 'Dori tayyorlanmoqda',
  ready: 'Kuryerga topshirildi', courier_accepted: 'Kuryerga topshirildi', delivering: 'Kuryer yetkazib bermoqda',
  delivered: 'Yetkazib berildi', cancelled: 'Bekor qilindi',
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => load('dg_theme', window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [lang, setLang] = useState(() => load('dg_lang', 'uz'))
  const [orders, setOrders] = useState(() => load('dg_orders', seedOrders))
  const [catalog, setCatalog] = useState(() => load('dg_catalog', defaultCatalog))
  const [recent, setRecent] = useState(() => load('dg_recent', ['Paratsetamol']))
  const [profile, setProfile] = useState(() => load('dg_profile', { name: 'Dilshod Karimov', phone: '+998 90 111 22 33', address: 'Amir Temur ko‘chasi, 18', extra: '' }))
  const [flow, setFlowState] = useState({ medicineId: null, pharmacyId: null, qty: 1, urgent: false })
  const orderActionLocks = useRef(new Set())
  const stockActionLock = useRef(false)

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); save('dg_theme', theme) }, [theme])
  useEffect(() => save('dg_lang', lang), [lang])
  useEffect(() => save('dg_orders', orders), [orders])
  useEffect(() => save('dg_catalog', catalog), [catalog])
  useEffect(() => save('dg_recent', recent), [recent])
  useEffect(() => save('dg_profile', profile), [profile])
  useEffect(() => {
    const sync = (e) => {
      if (e.key === 'dg_orders' && e.newValue) { try { setOrders(JSON.parse(e.newValue)) } catch {} }
      if (e.key === 'dg_catalog' && e.newValue) { try { setCatalog(JSON.parse(e.newValue)) } catch {} }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const t = useMemo(() => getDict(lang), [lang])
  const rememberSearch = useCallback((q) => setRecent((r) => [q, ...r.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5)), [])
  const createOrder = useCallback(({ medicine, pharmacy, qty, price, fee, address, name, phone, extra, urgent, etaMin, paymentMethod = 'cash' }) => {
    const id = `DG-${Math.floor(10000 + Math.random() * 89999)}`
    const order = {
      id, createdAt: Date.now(), status: 0, workflow: true, stage: 'new',
      medicineId: medicine.id, medicineName: medicine.name, medicineDesc: medicine.desc || '', qty,
      price, unitPrice: price, fee, total: price * qty + fee, paymentMethod,
      pharmacyId: pharmacy.id, pharmacyName: pharmacy.name, pharmacyAddress: pharmacy.address,
      address: extra ? `${address}, ${extra}` : address, name, phone, urgent,
      courier: COURIERS[0], etaMin, stockDeducted: false, stockRestored: false,
    }
    setOrders((o) => [order, ...o])
    setProfile((p) => ({ ...p, name, phone, address, extra: extra || '' }))
    return order
  }, [])
  const updateOrder = useCallback((id, patch) => setOrders((o) => o.map((x) => x.id === id ? { ...x, ...patch } : x)), [])
  const getOrder = useCallback((id) => orders.find((o) => o.id === id), [orders])
  const lookupMedicine = useCallback((id) => catalog.find((m) => m.id === id), [catalog])
  const lookupPharmacy = useCallback((id) => pharmacies.find((p) => p.id === id), [])
  const updateMedicine = useCallback((id, patch) => setCatalog((all) => all.map((m) => {
    if (m.id !== id) return m
    const next = { ...m, ...patch }
    if (patch.unitPrice !== undefined) {
      const nextStock = { ...(m.stock || {}) }
      Object.keys(nextStock).forEach((key) => { if (nextStock[key]) nextStock[key] = Number(patch.unitPrice) })
      if (Object.keys(nextStock).length === 0 && Number(patch.unitPrice) > 0) nextStock.p1 = Number(patch.unitPrice)
      next.stock = nextStock
    }
    return next
  })), [])
  const addMedicine = useCallback(({ name, desc, price, qty }) => {
    const id = `custom-${Date.now()}`
    setCatalog((all) => [...all, { id, name, aliases: [], form: 'Qadoq', maker: 'Dorigo', rx: false, desc, stock: { p1: Number(price) }, unitPrice: Number(price), inventoryQty: Number(qty), alternatives: [], isActive: true }])
  }, [])
  const deleteMedicine = useCallback((id) => setCatalog((all) => all.map((m) => m.id === id ? { ...m, isActive: false } : m)), [])
  const acceptOrder = useCallback((id) => {
    const order = orders.find((o) => o.id === id)
    if (!order || order.stage !== 'new') return { ok: false, message: 'Bu buyurtma allaqachon qabul qilingan.' }
    setOrders((all) => all.map((o) => o.id === id ? { ...o, stage: 'accepted' } : o))
    return { ok: true }
  }, [orders])
  const prepareOrder = useCallback((id) => {
    if (orderActionLocks.current.has(id) || stockActionLock.current) return { ok: false, message: 'Amal bajarilmoqda, biroz kuting.' }
    orderActionLocks.current.add(id); stockActionLock.current = true
    window.setTimeout(() => { orderActionLocks.current.delete(id); stockActionLock.current = false }, 350)
    const order = orders.find((o) => o.id === id)
    const med = catalog.find((m) => m.id === order?.medicineId)
    if (!order || order.stage !== 'accepted') return { ok: false, message: 'Avval buyurtmani qabul qiling.' }
    if (!med || Number(med.inventoryQty || 0) < order.qty) return { ok: false, message: `${order.medicineName || med?.name || 'Dori'} qoldig‘i yetarli emas.` }
    setCatalog((all) => all.map((m) => m.id === order.medicineId ? { ...m, inventoryQty: Number(m.inventoryQty || 0) - order.qty } : m))
    setOrders((all) => all.map((o) => o.id === id ? { ...o, stage: 'preparing', stockDeducted: true, stockRestored: false } : o))
    return { ok: true }
  }, [orders, catalog])
  const handoffOrder = useCallback((id) => {
    const order = orders.find((o) => o.id === id)
    if (!order || order.stage !== 'preparing') return { ok: false, message: 'Dori avval tayyorlanishi kerak.' }
    setOrders((all) => all.map((o) => o.id === id ? { ...o, stage: 'ready' } : o)); return { ok: true }
  }, [orders])
  const courierAcceptOrder = useCallback((id) => {
    const order = orders.find((o) => o.id === id)
    if (!order || order.stage !== 'ready') return { ok: false, message: 'Bu buyurtma boshqa kuryer tomonidan qabul qilingan yoki tayyor emas.' }
    setOrders((all) => all.map((o) => o.id === id ? { ...o, stage: 'courier_accepted', courierAcceptedAt: Date.now() } : o)); return { ok: true }
  }, [orders])
  const startDelivery = useCallback((id) => {
    const order = orders.find((o) => o.id === id)
    if (!order || order.stage !== 'courier_accepted') return { ok: false, message: 'Avval buyurtmani qabul qiling.' }
    setOrders((all) => all.map((o) => o.id === id ? { ...o, stage: 'delivering' } : o)); return { ok: true }
  }, [orders])
  const completeDelivery = useCallback((id) => {
    const order = orders.find((o) => o.id === id)
    if (!order || order.stage !== 'delivering') return { ok: false, message: 'Yetkazish jarayonini avval boshlang.' }
    setOrders((all) => all.map((o) => o.id === id ? { ...o, stage: 'delivered', status: 4, deliveredAt: Date.now() } : o)); return { ok: true }
  }, [orders])
  const cancelOrder = useCallback((id) => {
    if (orderActionLocks.current.has(id)) return { ok: false, message: 'Amal bajarilmoqda, biroz kuting.' }
    orderActionLocks.current.add(id); window.setTimeout(() => orderActionLocks.current.delete(id), 300)
    const order = orders.find((o) => o.id === id)
    if (!order || order.stage === 'cancelled') return { ok: false, message: 'Bu buyurtma allaqachon bekor qilingan.' }
    if (order.stockDeducted && !order.stockRestored) {
      setCatalog((all) => all.map((m) => m.id === order.medicineId ? { ...m, inventoryQty: Number(m.inventoryQty || 0) + order.qty } : m))
    }
    setOrders((all) => all.map((o) => o.id === id ? { ...o, stage: 'cancelled', status: 5, stockRestored: Boolean(o.stockDeducted) || o.stockRestored, cancelledAt: Date.now() } : o))
    return { ok: true }
  }, [orders])

  const value = {
    theme, toggleTheme: () => setTheme((x) => x === 'dark' ? 'light' : 'dark'), lang, setLang, t,
    orders, catalog, medicines: catalog.filter((m) => m.isActive !== false), createOrder, updateOrder, getOrder,
    recent, rememberSearch, profile, setProfile, flow, setFlow: (patch) => setFlowState((f) => ({ ...f, ...patch })),
    lookupMedicine, lookupPharmacy, updateMedicine, addMedicine, deleteMedicine,
    acceptOrder, prepareOrder, handoffOrder, courierAcceptOrder, startDelivery, completeDelivery, cancelOrder,
    stageLabels,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
