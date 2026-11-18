import { motion } from 'framer-motion'
import { Bike, Check, MapPin, Star, Wallet, Zap, X } from 'lucide-react'
import { formatSom } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function PharmacyCard({ row, index = 0, onPick, highlight = false }) {
  const { t } = useApp()
  const { pharmacy: p, price, available, eta } = row

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.07 }}
      whileHover={available ? { y: -4, boxShadow: '0 20px 50px -14px rgba(18,181,148,0.4)' } : undefined}
      className={`card relative overflow-hidden p-4 md:p-5 ${highlight ? 'ring-2 ring-brand-400' : ''} ${available ? '' : 'opacity-70'}`}
    >
      {highlight && (
        <div className="chip absolute right-4 top-4 bg-brand-500 text-white">
          <Zap size={12} /> {t.results.fastest}
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{p.name}</h3>
          <p className="truncate text-sm text-muted">{p.address}</p>
        </div>
        {!highlight && (
          <div className="chip shrink-0 bg-amber-400/15 text-amber-600 dark:text-amber-300">
            <Star size={12} fill="currentColor" /> {p.rating}
          </div>
        )}
      </div>

      <div className="mt-3">
        {available ? (
          <span className="chip bg-brand-500/15 text-brand-700 dark:text-brand-300"><Check size={13} strokeWidth={3} /> {t.results.available}</span>
        ) : (
          <span className="chip bg-red-500/10 text-red-600 dark:text-red-300"><X size={13} strokeWidth={3} /> {t.results.unavailable}</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <Stat Icon={MapPin} label={`${p.distanceKm} ${t.common.km}`} />
        <Stat Icon={Bike} label={`${eta.min}–${eta.max} ${t.common.min}`} />
        <Stat Icon={Wallet} label={available ? `${formatSom(price)}` : '—'} sub={available ? t.common.som : ''} />
      </div>

      {available && (
        <motion.button whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }} onClick={() => onPick(row)} className="btn-primary mt-4 w-full py-3">
          {t.results.pick}
        </motion.button>
      )}
    </motion.div>
  )
}

function Stat({ Icon, label, sub }) {
  return (
    <div className="rounded-2xl bg-brand-500/10 px-3 py-2">
      <Icon size={14} className="mb-1 text-brand-600 dark:text-brand-300" />
      <div className="text-[13px] font-bold leading-tight">{label}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </div>
  )
}
