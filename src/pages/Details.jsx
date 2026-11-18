import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bike, Clock, FileText, Minus, Plus, Star, Zap, MapPin } from 'lucide-react'
import MapView from '../components/MapView.jsx'
import { PageHeader } from '../components/Ui.jsx'
import { deliveryFee, etaRange, formatSom, pharmacies } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function Details() {
  const nav = useNavigate()
  const { t, flow, setFlow, medicines } = useApp()
  const medicine = medicines.find((m) => m.id === flow.medicineId)
  const pharmacy = pharmacies.find((p) => p.id === flow.pharmacyId)
  if (!medicine || !pharmacy) return <Navigate to="/search" replace />

  const price = medicine.stock[pharmacy.id]
  const eta = etaRange(pharmacy, flow.urgent)
  const fee = deliveryFee(pharmacy, flow.urgent)
  const total = price * flow.qty + fee

  return (
    <div>
      <PageHeader title={t.details.title} urgent={flow.urgent} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <MapView height="h-64 md:h-80" urgent={flow.urgent} selectedId={pharmacy.id} route={{ from: pharmacy }} pharmacies={[{ id: pharmacy.id, x: pharmacy.x, y: pharmacy.y, name: pharmacy.name }]} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t.details.medicine}</div>
            <h2 className="mt-1 text-xl font-extrabold">{medicine.name}</h2>
            <p className="text-sm text-muted">{medicine.form} · {medicine.maker}</p>
            <p className="mt-3">{medicine.desc}</p>
            {medicine.rx && (
              <div className="mt-3 flex gap-2 rounded-2xl bg-amber-400/15 p-3 text-sm text-amber-800 dark:text-amber-200"><FileText size={18} className="shrink-0" /> {t.details.rxNote}</div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t.details.pharmacy}</div>
            <div className="mt-1 flex items-center justify-between">
              <h3 className="text-lg font-bold">{pharmacy.name}</h3>
              <span className="chip bg-amber-400/15 text-amber-600 dark:text-amber-300"><Star size={12} fill="currentColor" /> {pharmacy.rating} ({pharmacy.reviews})</span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} /> {pharmacy.address} · {pharmacy.distanceKm} {t.common.km}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Clock size={14} /> {pharmacy.open}</p>
          </motion.div>
        </div>

        {/* summary */}
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className={`mb-4 flex items-center gap-3 rounded-2xl p-4 ${flow.urgent ? 'bg-urgent-500/15' : 'bg-brand-500/15'}`}>
              {flow.urgent ? <Zap size={24} className="text-urgent-500" fill="currentColor" /> : <Bike size={24} className="text-brand-600" />}
              <div>
                <div className="text-xs text-muted">{t.details.delivery}</div>
                <div className="text-xl font-extrabold">{eta.min}–{eta.max} {t.common.min}</div>
              </div>
            </div>

            <h3 className="mb-3 font-bold">{t.details.summary}</h3>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">{t.details.qty}</span>
              <div className="flex items-center gap-3">
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setFlow({ qty: Math.max(1, flow.qty - 1) })} className="glass grid h-10 w-10 place-items-center rounded-xl" aria-label="-"><Minus size={16} /></motion.button>
                <motion.span key={flow.qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center text-lg font-bold">{flow.qty}</motion.span>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setFlow({ qty: Math.min(5, flow.qty + 1) })} className="glass grid h-10 w-10 place-items-center rounded-xl" aria-label="+"><Plus size={16} /></motion.button>
              </div>
            </div>

            <Row label={t.details.medPrice} value={`${formatSom(price * flow.qty)} ${t.common.som}`} />
            <Row label={t.details.deliveryFee} value={`${formatSom(fee)} ${t.common.som}`} />
            <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
            <div className="flex items-center justify-between text-lg font-extrabold">
              <span>{t.details.total}</span>
              <motion.span key={total} initial={{ scale: 1.12 }} animate={{ scale: 1 }}>{formatSom(total)} {t.common.som}</motion.span>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={() => nav('/address')} className={`${flow.urgent ? 'btn-urgent' : 'btn-primary'} mt-5 w-full text-lg`}>
              {t.details.order}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
