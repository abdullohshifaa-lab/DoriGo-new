import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext.jsx'

export function PageHeader({ title, sub, back = true, urgent = false }) {
  const nav = useNavigate()
  const { t } = useApp()
  return (
    <div className="mb-6 flex items-center gap-3">
      {back && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ x: -3 }}
          onClick={() => nav(-1)}
          aria-label={t.common.back}
          className="glass grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
        >
          <ArrowLeft size={20} />
        </motion.button>
      )}
      <div>
        <h1 className={`text-2xl font-extrabold md:text-3xl ${urgent ? 'text-urgent-500' : ''}`}>{title}</h1>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-3xl ${className}`} />
}

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Word-by-word text reveal
export function TextReveal({ text, className = '', delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  )
}
