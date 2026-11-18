import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutGroup, motion } from 'framer-motion'
import { AlertTriangle, Clock, MapPin, PackageSearch, Wallet, Zap, Loader2, Info } from 'lucide-react'
import PharmacyCard from '../components/PharmacyCard.jsx'
import MapView from '../components/MapView.jsx'
import { PageHeader, Skeleton } from '../components/Ui.jsx'
import { findMedicine, searchPharmacies, sortRows } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function Results() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const urgent = params.get('urgent') === '1'
  const nav = useNavigate()
  const { t, setFlow, medicines: catalog } = useApp()
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('fast')

  useEffect(() => {
    setLoading(true)
    const id = setTimeout(() => setLoading(false), 1300)
    return () => clearTimeout(id)
  }, [q])

  const medicine = useMemo(() => findMedicine(q, catalog), [q, catalog])
  const { withStock, without } = useMemo(() => (medicine ? searchPharmacies(medicine, urgent) : { withStock: [], without: [] }), [medicine, urgent])
  const rows = useMemo(() => sortRows(withStock, urgent ? 'fast' : sort), [withStock, sort, urgent])

  // Alternatives that exist nearby (substitution must be confirmed by a pharmacist/doctor)
  const alternatives = useMemo(() => {
    if (!medicine) return []
    return medicine.alternatives
      .map((id) => catalog.find((m) => m.id === id))
      .filter((m) => m && Object.keys(m.stock || {}).length > 0 && (m.inventoryQty === undefined || Number(m.inventoryQty) > 0))
  }, [medicine, catalog])

  const pick = (row) => {
    setFlow({ medicineId: medicine.id, pharmacyId: row.pharmacy.id, qty: 1, urgent })
    nav('/details')
  }

  const tabs = [
    { id: 'fast', label: t.results.sortFast, Icon: Clock },
    { id: 'close', label: t.results.sortClose, Icon: MapPin },
    { id: 'cheap', label: t.results.sortCheap, Icon: Wallet },
  ]

  return (
    <div>
      <PageHeader
        title={medicine ? medicine.name : q}
        sub={medicine ? medicine.form : t.results.title}
        urgent={urgent}
      />

      {loading ? (
        <div>
          <div className="mb-5 flex items-center gap-3 text-muted">
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Loader2 size={20} className="text-brand-500" /></motion.span>
            <span className="font-semibold">{t.results.searching}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-44" />)}
          </div>
        </div>
      ) : !medicine || withStock.length === 0 ? (
        <NotFound t={t} alternatives={alternatives} q={q} onAlt={(m) => nav(`/results?q=${encodeURIComponent(m.name)}`)} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div>
            {urgent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-2 rounded-2xl bg-urgent-500/15 px-4 py-3 font-semibold text-urgent-600 dark:text-urgent-400">
                <Zap size={18} fill="currentColor" /> {t.urgent.badge}
              </motion.div>
            )}

            <p className="mb-3 font-semibold text-brand-700 dark:text-brand-300">{t.results.foundIn(withStock.length)}</p>

            {!urgent && (
              <div className="glass relative mb-4 flex rounded-2xl p-1">
                {tabs.map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => setSort(id)} className="relative flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold">
                    {sort === id && (
                      <motion.span layoutId="sort-pill" className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-md" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                    )}
                    <span className={`relative flex items-center justify-center gap-1.5 ${sort === id ? 'text-white' : 'text-muted'}`}>
                      <Icon size={15} /> {label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <LayoutGroup>
              <div className="grid gap-4">
                  {rows.map((row, i) => (
                    <PharmacyCard key={row.pharmacy.id} row={row} index={i} highlight={i === 0 && (urgent || sort === 'fast')} onPick={pick} />
                  ))}
              </div>
            </LayoutGroup>

            {without.length > 0 && (
              <div className="mt-6">
                <p className="mb-1 text-sm font-semibold text-muted">{t.results.partial}</p>
                <p className="mb-3 text-sm text-muted">
                  {without.map((w) => w.pharmacy.name).join(', ')} — {t.results.unavailable.toLowerCase()}.
                </p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <MapView
              height="h-72 lg:h-[460px]"
              urgent={urgent}
              selectedId={rows[0]?.pharmacy.id}
              pharmacies={withStock.map((r) => ({ id: r.pharmacy.id, x: r.pharmacy.x, y: r.pharmacy.y, name: r.pharmacy.name }))}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function NotFound({ t, alternatives, q, onAlt }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
      <div className="card p-8 text-center">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-brand-500/15 text-brand-500">
          <PackageSearch size={38} />
        </motion.div>
        <h2 className="text-xl font-extrabold">{t.results.notFoundNear}</h2>
        {q && <p className="mt-1 text-muted">“{q}”</p>}
      </div>

      {alternatives.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-3 font-bold">{t.results.altTitle}</h3>
          <div className="grid gap-3">
            {alternatives.map((m) => (
              <motion.button key={m.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} onClick={() => onAlt(m)} className="card p-4 text-left">
                <div className="font-bold">{m.name}</div>
                <div className="text-sm text-muted">{m.form}</div>
              </motion.button>
            ))}
          </div>
          <div className="mt-4 flex gap-3 rounded-2xl bg-amber-400/15 p-4 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle size={20} className="shrink-0" />
            <p>{t.results.altNote}</p>
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted"><Info size={15} /> {t.assistant.safety}</div>
    </motion.div>
  )
}
