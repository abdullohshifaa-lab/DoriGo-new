import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bike, Clock, Hash } from 'lucide-react'
import { useApp } from '../store/AppContext.jsx'

const particles = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2
  const dist = 90 + (i % 4) * 28
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, c: ['#12b594', '#2fd1ad', '#38bdf8', '#fbbf24'][i % 4], d: (i % 5) * 0.03 }
})

export default function Confirmation() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, getOrder, lookupMedicine, lookupPharmacy } = useApp()
  const order = getOrder(id)
  if (!order) return <Navigate to="/" replace />
  const med = lookupMedicine(order.medicineId)
  const ph = lookupPharmacy(order.pharmacyId)

  return (
    <div className="mx-auto max-w-md pt-6 text-center">
      <div className="relative mx-auto mb-8 grid h-32 w-32 place-items-center">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{ background: p.c }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: p.x, y: p.y, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 1.1, delay: 0.45 + p.d, ease: 'easeOut' }}
          />
        ))}
        <motion.span className="absolute inset-0 rounded-full bg-brand-500/25" initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.2, delay: 0.3 }} />
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 shadow-2xl shadow-brand-500/40"
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }} />
          </svg>
        </motion.div>
      </div>

      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-3xl font-extrabold">{t.confirm.title}</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="mt-2 text-muted">{t.confirm.sub}</motion.p>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="card mt-8 space-y-3 p-5 text-left">
        <div className="flex items-center gap-3"><Hash size={18} className="text-brand-500" /><div><div className="text-xs text-muted">{t.confirm.number}</div><div className="font-bold">{order.id}</div></div></div>
        <div className="flex items-center gap-3"><Bike size={18} className="text-brand-500" /><div><div className="text-xs text-muted">{ph.name}</div><div className="font-bold">{med.name} × {order.qty}</div></div></div>
        <div className="flex items-center gap-3"><Clock size={18} className="text-brand-500" /><div><div className="text-xs text-muted">{t.confirm.eta}</div><div className="font-bold">~{order.etaMin} {t.common.min}</div></div></div>
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => nav(`/track/${order.id}`, { replace: true })} className={`${order.urgent ? 'btn-urgent' : 'btn-primary'} mt-6 w-full text-lg`}>
        {t.confirm.track}
      </motion.button>
    </div>
  )
}
