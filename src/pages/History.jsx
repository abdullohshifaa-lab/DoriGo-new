import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, RotateCcw, Zap } from 'lucide-react'
import { PageHeader } from '../components/Ui.jsx'
import { formatSom } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function History() {
  const nav = useNavigate()
  const { t, orders, lookupMedicine, lookupPharmacy, setFlow } = useApp()

  const reorder = (o) => {
    setFlow({ medicineId: o.medicineId, pharmacyId: o.pharmacyId, qty: o.qty, urgent: o.urgent })
    nav('/details')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.history.title} back={false} />
      {orders.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-10 text-center">
          <ClipboardList size={40} className="mx-auto mb-3 text-brand-500" />
          <h2 className="text-lg font-bold">{t.history.empty}</h2>
          <p className="mt-1 text-muted">{t.history.emptySub}</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((o, i) => {
            const med = lookupMedicine(o.medicineId)
            const ph = lookupPharmacy(o.pharmacyId)
            const active = o.workflow ? !['delivered', 'cancelled'].includes(o.stage) : o.status < 4
            const canTrack = o.workflow ? o.stage !== 'cancelled' : active
            const statusLabel = o.workflow ? ({ new: 'Yangi buyurtma', accepted: 'Dorixona qabul qildi', preparing: 'Dori tayyorlanmoqda', ready: 'Kuryerga topshirildi', courier_accepted: 'Kuryerga topshirildi', delivering: 'Kuryer yetkazib bermoqda', delivered: 'Yetkazib berildi', cancelled: 'Bekor qilindi' }[o.stage] || 'Buyurtma') : (active ? t.history.active : t.history.delivered)
            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{o.medicineName || med?.name || 'Dori'}</h3>
                      {o.urgent && <Zap size={15} className="text-urgent-500" fill="currentColor" />}
                    </div>
                    <p className="text-sm text-muted">{o.pharmacyName || ph?.name || 'Dorigo'} · {new Date(o.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })} · {o.id}</p>
                  </div>
                  <span className={`chip shrink-0 ${active ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300' : 'bg-brand-500/15 text-brand-700 dark:text-brand-300'}`}>
                    {active && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />}
                    {statusLabel}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-extrabold">{formatSom(o.total)} {t.common.som}</div>
                  {canTrack ? (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => nav(`/track/${o.id}`)} className="btn-primary px-4 py-2.5 text-sm">{t.history.open}</motion.button>
                  ) : (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => reorder(o)} className="btn-ghost text-sm"><RotateCcw size={15} /> {t.history.again}</motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
