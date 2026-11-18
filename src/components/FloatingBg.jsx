import { motion } from 'framer-motion'
import { Pill, Plus, Heart, Cross } from 'lucide-react'

const blobs = [
  { cls: 'left-[-10%] top-[-8%] h-[420px] w-[420px] bg-brand-400/30', d: 0 },
  { cls: 'right-[-12%] top-[18%] h-[360px] w-[360px] bg-sky-400/20', d: 2 },
  { cls: 'left-[20%] bottom-[-14%] h-[400px] w-[400px] bg-brand-600/20', d: 4 },
]

const icons = [
  { Icon: Pill, x: '8%', y: '22%', s: 28, d: 0 },
  { Icon: Plus, x: '88%', y: '14%', s: 24, d: 1.5 },
  { Icon: Heart, x: '80%', y: '62%', s: 26, d: 3 },
  { Icon: Cross, x: '14%', y: '70%', s: 24, d: 2 },
  { Icon: Pill, x: '60%', y: '86%', s: 22, d: 4 },
]

export default function FloatingBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${b.cls}`}
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: 16 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: b.d }}
        />
      ))}
      {icons.map(({ Icon, x, y, s, d }, i) => (
        <motion.div
          key={i}
          className="absolute text-brand-500/25"
          style={{ left: x, top: y }}
          animate={{ y: [0, -22, 0], rotate: [0, 12, -8, 0] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: 'easeInOut', delay: d }}
        >
          <Icon size={s} />
        </motion.div>
      ))}
    </div>
  )
}
