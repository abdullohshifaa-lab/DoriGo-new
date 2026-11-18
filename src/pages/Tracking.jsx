import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Home as HomeIcon, Phone, Bike, Store, PackageCheck } from 'lucide-react'
import MapView from '../components/MapView.jsx'
import { PageHeader } from '../components/Ui.jsx'
import { USER_POS } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

const stepIcons = [Check, Store, PackageCheck, Bike, HomeIcon]
const TICKS = 14 // courier ride length in 1s ticks

// L-shaped route: pharmacy -> (pharmacy.x, user.y) -> user
function pointAt(from, f) {
  const l1 = Math.abs(from.y - USER_POS.y)
  const l2 = Math.abs(from.x - USER_POS.x)
  const d = f * (l1 + l2)
  if (d <= l1) return { x: from.x, y: from.y + Math.sign(USER_POS.y - from.y) * d }
  const r = d - l1
  return { x: from.x + Math.sign(USER_POS.x - from.x) * r, y: USER_POS.y }
}

export default function Tracking() {
  const { id } = useParams()
  const { t, getOrder, updateOrder, lookupPharmacy, lookupMedicine, cancelOrder } = useApp()
  const order = getOrder(id)
  const [ride, setRide] = useState(0)
  const timers = useRef([])

  const status = order?.status ?? 0

  // Simulated order lifecycle
  useEffect(() => {
    if (!order || order.workflow || order.status >= 4) return
    const clear = () => timers.current.forEach(clearTimeout)
    clear()
    const plan = [
      [0, 2500],
      [1, 5000],
      [2, 7500],
    ]
    plan.forEach(([from, at]) => {
      if (order.status <= from) timers.current.push(setTimeout(() => updateOrder(id, { status: from + 1 }), at))
    })
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Courier movement while "on the way"
  useEffect(() => {
    if (order?.workflow || status !== 3) return
    setRide(0)
    const iv = setInterval(() => {
      setRide((r) => {
        if (r + 1 >= TICKS) {
          clearInterval(iv)
          updateOrder(id, { status: 4 })
          return TICKS
        }
        return r + 1
      })
    }, 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id])

  const pharmacy = order ? lookupPharmacy(order.pharmacyId) : null
  const courierPos = useMemo(() => {
    if (!pharmacy) return null
    if (status >= 4) return { x: USER_POS.x, y: USER_POS.y }
    if (status === 3) return pointAt(pharmacy, ride / TICKS)
    return { x: pharmacy.x, y: pharmacy.y }
  }, [pharmacy, status, ride])

  if (!order) return <Navigate to="/orders" replace />
  const med = lookupMedicine(order.medicineId)
  if (order.workflow) {
    const stages = [
      { key: 'new', label: 'Yangi buyurtma', detail: 'Buyurtmangiz dorixonaga yuborildi.' },
      { key: 'accepted', label: 'Dorixona buyurtmani qabul qildi', detail: 'Sotuvchi buyurtmani tasdiqladi.' },
      { key: 'preparing', label: 'Dori tayyorlanmoqda', detail: 'Dorilar ombordan ajratilmoqda.' },
      { key: 'ready', label: 'Kuryerga topshirildi', detail: 'Buyurtma kuryer tomonidan qabul qilinishini kutmoqda.' },
      { key: 'delivering', label: 'Kuryer yetkazib bermoqda', detail: 'Kuryer buyurtmani manzilingizga olib kelmoqda.' },
      { key: 'delivered', label: 'Yetkazib berildi', detail: 'Buyurtma muvaffaqiyatli yakunlandi.' },
    ]
    const idx = order.stage === 'courier_accepted' ? 3 : stages.findIndex((x) => x.key === order.stage)
    const cancelled = order.stage === 'cancelled'
    const pharmacyFlow = lookupPharmacy(order.pharmacyId)
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={t.track.title} sub={`${order.id} · ${order.medicineName || med?.name || 'Dori'}`} urgent={order.urgent} />
        <div className="grid gap-5 md:grid-cols-[.85fr_1.15fr]">
          <div className="space-y-4">
            <div className="card p-5"><div className="text-sm text-muted">Buyurtma holati</div><h2 className="mt-1 text-xl font-extrabold">{cancelled ? 'Bekor qilindi' : stages[Math.max(0, idx)]?.label}</h2><p className="mt-2 text-sm text-muted">{cancelled ? 'Buyurtma bekor qilingan. Agar ombor qoldig‘i kamaytirilgan bo‘lsa, u qaytarildi.' : stages[Math.max(0, idx)]?.detail}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-500/10"><div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${cancelled ? 100 : (Math.max(0, idx) / 5) * 100}%` }} /></div><p className="mt-3 text-xs text-muted">Holat faqat sotuvchi yoki kuryer amal bajarganda o‘zgaradi.</p></div>
            <div className="card p-5"><p className="text-xs text-muted">Buyurtma summasi</p><p className="mt-1 text-2xl font-extrabold">{new Intl.NumberFormat('uz-UZ').format(order.total)} so‘m</p><p className="mt-2 text-sm text-muted">{order.pharmacyName || pharmacyFlow?.name} · {order.paymentMethod === 'card' ? 'Karta (demo)' : 'Naqd pul'}</p><p className="mt-1 text-sm">{order.medicineName || med?.name} × {order.qty}</p></div>
            {!cancelled && <button onClick={() => { if (window.confirm('Buyurtmani bekor qilmoqchimisiz?')) cancelOrder(order.id) }} className="w-full rounded-2xl border border-rose-500/25 px-5 py-3 font-semibold text-rose-600 transition hover:bg-rose-500/10">Buyurtmani bekor qilish</button>}
            <Link to="/orders" className="btn-ghost w-full">Buyurtmalar tarixiga qaytish</Link>
          </div>
          <div className="card p-5"><h2 className="mb-5 text-lg font-extrabold">Yetkazish bosqichlari</h2>{cancelled ? <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-600">Buyurtma bekor qilindi.</div> : <ol className="space-y-5">{stages.map((st, i) => { const done = i < idx || order.stage === 'delivered'; const current = i === idx && order.stage !== 'delivered'; return <li key={st.key} className="flex gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${done ? 'bg-brand-500 text-white' : current ? 'bg-brand-500/15 text-brand-700 ring-2 ring-brand-500/30' : 'bg-brand-500/5 text-muted'}`}>{done ? <Check size={17} /> : i + 1}</span><div><p className={`font-bold ${done || current ? '' : 'text-muted'}`}>{st.label}</p><p className="mt-0.5 text-sm text-muted">{st.detail}</p></div></li> })}</ol>}<div className="mt-6 rounded-2xl bg-brand-500/5 p-4 text-sm"><p className="font-bold">Yetkazish manzili</p><p className="mt-1 text-muted">{order.address}</p><p className="mt-3 font-bold">Telefon</p><a className="mt-1 inline-block text-brand-600" href={`tel:${order.phone}`}>{order.phone}</a></div></div>
        </div>
      </div>
    )
  }
  const left = status === 3 ? Math.max(1, Math.ceil(((TICKS - ride) / TICKS) * order.etaMin)) : status >= 4 ? 0 : order.etaMin
  const progress = status >= 4 ? 100 : (status / 4) * 100 + (status === 3 ? (ride / TICKS) * 25 : 0)

  return (
    <div>
      <PageHeader title={t.track.title} sub={`${order.id} · ${med.name}`} urgent={order.urgent} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <MapView height="h-80 md:h-[480px]" urgent={order.urgent} selectedId={pharmacy.id} route={{ from: pharmacy }} courier={courierPos} pharmacies={[{ id: pharmacy.id, x: pharmacy.x, y: pharmacy.y, name: pharmacy.name }]} />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-1 flex items-end justify-between">
              <div>
                <div className="text-xs text-muted">{t.track.arrival}</div>
                <AnimatePresence mode="wait">
                  <motion.div key={left} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="font-display text-4xl font-extrabold">
                    {status >= 4 ? t.track.done : `${left} ${t.track.min}`}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="text-right text-sm text-muted">{pharmacy.name}</div>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-500/15">
              <motion.div className={`h-full rounded-full ${order.urgent ? 'bg-gradient-to-r from-urgent-400 to-urgent-600' : 'bg-gradient-to-r from-brand-300 to-brand-600'}`} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
            </div>
          </div>

          <div className="card p-5">
            <ol className="relative">
              {t.track.steps.map((label, i) => {
                const done = status > i || status >= 4
                const current = status === i && status < 4
                const Icon = stepIcons[i]
                return (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < 4 && (
                      <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-brand-500/20">
                        <motion.span className="block w-full bg-brand-500" initial={{ height: 0 }} animate={{ height: done ? '100%' : 0 }} transition={{ duration: 0.6 }} />
                      </span>
                    )}
                    <motion.span
                      animate={{ scale: current ? [1, 1.12, 1] : 1 }}
                      transition={{ repeat: current ? Infinity : 0, duration: 1.4 }}
                      className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${done ? 'bg-brand-500 text-white' : current ? 'bg-brand-500/20 text-brand-600 ring-2 ring-brand-500' : 'bg-brand-500/10 text-muted'}`}
                    >
                      {done ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}><Check size={18} strokeWidth={3} /></motion.span> : <Icon size={18} />}
                    </motion.span>
                    <div className="pt-2">
                      <div className={`font-semibold ${done || current ? '' : 'text-muted'}`}>{label}</div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          {status >= 2 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-4 p-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white">{order.courier.name[0]}</span>
              <div className="flex-1">
                <div className="font-bold">{order.courier.name}</div>
                <div className="text-sm text-muted">{order.courier.vehicle} · ★ {order.courier.rating}</div>
              </div>
              <motion.a whileTap={{ scale: 0.9 }} href={`tel:${order.courier.phone.replace(/\s/g, '')}`} className="btn-primary px-4 py-3" aria-label={t.track.call}><Phone size={18} /></motion.a>
            </motion.div>
          )}

          {status >= 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-brand-500/15 p-5 text-center">
              <div className="text-lg font-bold">{t.track.delivered}</div>
              <Link to="/" className="btn-primary mt-4 w-full">{t.track.home}</Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
