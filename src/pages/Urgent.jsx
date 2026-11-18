import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bike, Check, Loader2, MapPin, Phone, Zap } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import MapView from '../components/MapView.jsx'
import { findMedicine, formatSom, searchPharmacies, sortRows } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function Urgent() {
  const nav = useNavigate()
  const { t, setFlow, rememberSearch, medicines } = useApp()
  const [state, setState] = useState({ phase: 'idle', best: null, medicine: null, q: '' })

  const find = (q) => {
    rememberSearch(q)
    setState({ phase: 'loading', best: null, medicine: null, q })
    setTimeout(() => {
      const medicine = findMedicine(q, medicines)
      if (!medicine) return setState({ phase: 'none', best: null, medicine: null, q })
      const { withStock } = searchPharmacies(medicine, true)
      const best = sortRows(withStock, 'fast')[0] || null
      setState({ phase: best ? 'found' : 'none', best, medicine, q })
    }, 1200)
  }

  const order = () => {
    setFlow({ medicineId: state.medicine.id, pharmacyId: state.best.pharmacy.id, qty: 1, urgent: true })
    nav('/details')
  }

  const { phase, best, medicine } = state

  return (
    <div className="relative">
      {/* urgent glow */}
      <motion.div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-urgent-500/25 blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }} />

      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-2 rounded-full bg-urgent-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-urgent-500/30">
          <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.3 }}><Zap size={16} fill="currentColor" /></motion.span>
          {t.urgent.badge}
        </motion.div>
        <h1 className="text-3xl font-extrabold md:text-5xl">{t.urgent.title}</h1>
        <p className="mt-2 text-lg text-muted">{t.urgent.sub}</p>

        <div className="mt-7">
          <SearchBar urgent onSubmit={find} placeholder={t.urgent.placeholder} cta={t.urgent.find} />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 flex items-center gap-3 font-semibold text-urgent-600 dark:text-urgent-400">
              <Loader2 className="animate-spin" size={20} /> {t.results.searching}
            </motion.div>
          )}

          {phase === 'none' && (
            <motion.div key="n" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card mt-8 p-6 text-center font-bold">
              {t.results.notFoundNear}
            </motion.div>
          )}

          {phase === 'found' && best && (
            <motion.div key="f" initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} className="mt-8">
              <div className="card relative overflow-hidden p-6 ring-2 ring-urgent-500">
                <motion.div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-urgent-400 via-amber-300 to-urgent-600" animate={{ backgroundPositionX: ['0%', '100%'] }} />
                <div className="mb-4 flex items-center gap-2 text-sm font-extrabold tracking-wide text-urgent-600 dark:text-urgent-400">
                  <Zap size={16} fill="currentColor" /> {t.urgent.best}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Tile Icon={MapPin} label={t.urgent.pharmacy} value={`${best.pharmacy.distanceKm} ${t.common.km}`} sub={best.pharmacy.name} />
                  <Tile Icon={Check} label={t.urgent.medicine} value={t.results.available} sub={`${medicine.name} · ${formatSom(best.price)} ${t.common.som}`} />
                  <Tile Icon={Bike} label={t.urgent.arrival} value={`${best.eta.min}–${best.eta.max} ${t.common.min}`} sub={`+${formatSom(best.fee)} ${t.common.som}`} accent />
                </div>

                <div className="mt-5">
                  <MapView height="h-52" urgent selectedId={best.pharmacy.id} route={{ from: best.pharmacy }} pharmacies={[{ id: best.pharmacy.id, x: best.pharmacy.x, y: best.pharmacy.y, name: best.pharmacy.name }]} />
                </div>

                <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={order} className="btn-urgent mt-5 w-full text-lg">
                  <Zap size={20} fill="currentColor" /> {t.urgent.go}
                </motion.button>
                <p className="mt-3 text-center text-sm text-muted">{t.urgent.note}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} href="tel:103" className="glass mt-8 flex items-center gap-3 rounded-2xl p-4 text-sm font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/15 text-red-500"><Phone size={18} /></span>
          {t.urgent.ambulance}
        </motion.a>
      </div>
    </div>
  )
}

function Tile({ Icon, label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? 'bg-urgent-500/15' : 'bg-brand-500/10'}`}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted"><Icon size={14} /> {label}</div>
      <div className="font-display text-xl font-extrabold">{value}</div>
      <div className="truncate text-xs text-muted">{sub}</div>
    </div>
  )
}
