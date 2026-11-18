import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Bike, Check, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import { Reveal, TextReveal } from '../components/Ui.jsx'
import { popularSearches } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

const stepIcons = [Search, ShieldCheck, Bike]

export default function Home() {
  const nav = useNavigate()
  const { t, rememberSearch } = useApp()

  const go = (q) => {
    rememberSearch(q)
    nav(`/results?q=${encodeURIComponent(q)}`)
  }

  return (
    <div>
      <section className="grid items-center gap-10 pt-4 md:grid-cols-[1.15fr_0.85fr] md:pt-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <Sparkles size={15} className="text-brand-500" /> {t.home.badge}
          </motion.div>

          <h1 className="text-4xl font-extrabold leading-[1.08] md:text-6xl">
            <TextReveal text={t.home.title1} />
            <br />
            <TextReveal text={t.home.title2} delay={0.25} className="bg-gradient-to-r from-brand-500 to-sky-500 bg-clip-text text-transparent" />
          </h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-5 max-w-xl text-lg text-muted">
            {t.home.sub}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mt-8">
            <SearchBar onSubmit={go} />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">{t.home.popular}:</span>
              {popularSearches.map((p, i) => (
                <motion.button
                  key={p}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.06 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => go(p)}
                  className="glass rounded-full px-3.5 py-1.5 text-sm font-semibold"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => nav('/urgent')}
            className="btn-urgent mt-7 w-full sm:w-auto"
          >
            <motion.span animate={{ rotate: [0, -14, 14, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}><Zap size={20} fill="currentColor" /></motion.span>
            {t.home.urgentCta} · 5 {t.common.min}
          </motion.button>
        </div>

        {/* floating preview card */}
        <motion.div initial={{ opacity: 0, scale: 0.9, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 120, damping: 16 }} className="relative mx-auto w-full max-w-sm">
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">Oq Dori</div>
                <div className="text-xs text-muted">Amir Temur ko‘chasi, 42</div>
              </div>
              <span className="chip bg-brand-500 text-white"><Zap size={12} /> {t.results.fastest}</span>
            </div>
            <span className="chip bg-brand-500/15 text-brand-700 dark:text-brand-300"><Check size={13} strokeWidth={3} /> {t.results.available}</span>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-bold">
              <div className="rounded-2xl bg-brand-500/10 p-2"><MapPin size={14} className="mx-auto mb-1 text-brand-500" />0.6 km</div>
              <div className="rounded-2xl bg-brand-500/10 p-2"><Bike size={14} className="mx-auto mb-1 text-brand-500" />5–7 min</div>
              <div className="rounded-2xl bg-brand-500/10 p-2">8 500<div className="text-[11px] font-medium text-muted">so‘m</div></div>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} className="glass absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl p-3 shadow-soft">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white"><Bike size={18} /></span>
            <div className="text-sm"><div className="font-bold">{t.track.steps[3]}</div><div className="text-xs text-muted">2 {t.common.min}</div></div>
          </motion.div>
        </motion.div>
      </section>

      {/* stats */}
      <Reveal className="mt-20 grid grid-cols-3 gap-3">
        {t.home.stats.map((s, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className="card p-4 text-center">
            <div className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300 md:text-4xl">{s.v}</div>
            <div className="mt-1 text-xs text-muted md:text-sm">{s.l}</div>
          </motion.div>
        ))}
      </Reveal>

      {/* how it works */}
      <section className="mt-20">
        <Reveal><h2 className="mb-6 text-2xl font-extrabold md:text-3xl">{t.home.howTitle}</h2></Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {t.home.steps.map((s, i) => {
            const Icon = stepIcons[i]
            return (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6 }} className="card h-full p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/30"><Icon size={22} /></span>
                    <span className="font-display text-4xl font-extrabold text-brand-500/25">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold">{s.t}</h3>
                  <p className="mt-1 text-muted">{s.d}</p>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </section>
    </div>
  )
}
