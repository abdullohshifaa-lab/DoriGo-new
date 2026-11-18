import { motion } from 'framer-motion'

export default function Logo({ size = 36, text = true }) {
  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        whileHover={{ rotate: 8, scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        style={{ width: size, height: size }}
        className="grid place-items-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30"
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round">
          <path d="M12 4v16M4 12h16" />
        </svg>
      </motion.div>
      {text && <span className="font-display text-xl font-extrabold tracking-tight">Dori<span className="text-brand-500">Go</span></span>}
    </div>
  )
}
