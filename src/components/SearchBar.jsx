import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pill, Search, ArrowRight, Zap } from 'lucide-react'
import { suggestMedicines } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function SearchBar({ onSubmit, placeholder, cta, urgent = false, autoFocus = false, initial = '' }) {
  const { t, medicines } = useApp()
  const [q, setQ] = useState(initial)
  const [focus, setFocus] = useState(false)
  const suggestions = focus ? suggestMedicines(q, 5, medicines) : []

  const submit = (value = q) => {
    const v = value.trim()
    if (v) onSubmit(v)
  }

  return (
    <div className="relative">
      <motion.form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        animate={{ scale: focus ? 1.015 : 1, boxShadow: focus ? `0 18px 50px -12px ${urgent ? 'rgba(255,106,51,0.45)' : 'rgba(18,181,148,0.45)'}` : '0 10px 30px -14px rgba(15,77,67,0.3)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="glass flex items-center gap-2 rounded-3xl p-2 pl-4"
        style={{ background: 'var(--card-solid)' }}
      >
        <motion.span animate={{ rotate: focus ? 90 : 0 }} className={urgent ? 'text-urgent-500' : 'text-brand-500'}>
          <Search size={22} />
        </motion.span>
        <input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          placeholder={placeholder || t.home.placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 text-base font-medium outline-none placeholder:text-muted md:text-lg"
          aria-label={placeholder || t.home.placeholder}
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.03 }}
          className={`${urgent ? 'btn-urgent' : 'btn-primary'} shrink-0 px-4 py-3 md:px-6`}
        >
          {urgent ? <Zap size={18} /> : null}
          <span className="hidden sm:inline">{cta || t.home.cta}</span>
          <ArrowRight size={18} />
        </motion.button>
      </motion.form>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="card absolute inset-x-0 top-full z-30 mt-2 overflow-hidden p-2"
            style={{ background: 'var(--card-solid)' }}
          >
            {suggestions.map((m, i) => (
              <motion.li key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQ(m.name)
                    submit(m.name)
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-brand-500/10"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/15 text-brand-600"><Pill size={18} /></span>
                  <span>
                    <span className="block font-semibold">{m.name}</span>
                    <span className="block text-xs text-muted">{m.form}</span>
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
