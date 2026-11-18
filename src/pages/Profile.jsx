import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, HelpCircle, Languages, MapPin, Moon, ShieldCheck, Sun } from 'lucide-react'
import { PageHeader } from '../components/Ui.jsx'
import { LANG_LABELS } from '../i18n/index.js'
import { useApp } from '../store/AppContext.jsx'

function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-8 w-14 rounded-full transition-colors ${on ? 'bg-brand-500' : 'bg-gray-400/40'}`}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 h-6 w-6 rounded-full bg-white shadow" style={{ left: on ? 28 : 4 }} />
    </button>
  )
}


function Row({ Icon, label, children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }} className="flex items-center justify-between gap-3 py-3.5">
      <div className="flex items-center gap-3 font-semibold">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300"><Icon size={18} /></span>
        {label}
      </div>
      {children}
    </motion.div>
  )
}

export default function Profile() {
  const { t, theme, toggleTheme, lang, setLang, profile } = useApp()
  const [notif, setNotif] = useState(true)


  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t.profile.title} back={false} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-5 flex items-center gap-4 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-300 to-brand-600 font-display text-2xl font-extrabold text-white shadow-lg shadow-brand-500/30">{(profile.name || 'D')[0]}</div>
        <div>
          <div className="text-lg font-extrabold">{profile.name}</div>
          <div className="text-sm text-muted">{profile.phone}</div>
        </div>
      </motion.div>

      <div className="card divide-y px-5" style={{ borderColor: 'var(--border)' }}>
        <Row Icon={MapPin} label={t.profile.addresses} delay={0.05}>
          <span className="max-w-[10rem] truncate text-sm text-muted">{profile.address}</span>
        </Row>
        <Row Icon={theme === 'dark' ? Moon : Sun} label={t.profile.theme} delay={0.1}>
          <Toggle on={theme === 'dark'} onChange={toggleTheme} label={theme === 'dark' ? t.profile.dark : t.profile.light} />
        </Row>
        <Row Icon={Languages} label={t.profile.language} delay={0.15}>
          <div className="flex gap-1.5">
            {Object.keys(LANG_LABELS).map((l) => (
              <motion.button key={l} whileTap={{ scale: 0.92 }} onClick={() => setLang(l)} className={`rounded-xl px-3 py-1.5 text-sm font-bold uppercase ${lang === l ? 'bg-brand-500 text-white' : 'glass'}`}>{l}</motion.button>
            ))}
          </div>
        </Row>
        <Row Icon={Bell} label={t.profile.notifications} delay={0.2}>
          <Toggle on={notif} onChange={setNotif} label={t.profile.notifications} />
        </Row>
        <Row Icon={HelpCircle} label={t.profile.help} delay={0.25}>
          <span className="text-sm text-muted">+998 71 200 00 00</span>
        </Row>
      </div>

      <p className="mt-5 flex items-start gap-2 text-sm text-muted"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-500" /> {t.profile.note}</p>
    </div>
  )
}
