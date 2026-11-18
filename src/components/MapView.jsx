import { motion } from 'framer-motion'
import { Home, Bike, Cross } from 'lucide-react'
import { USER_POS } from '../data/mock.js'

// Stylised city map. Markers are HTML overlays positioned in % so animation is reliable.
// props:
//  pharmacies: [{id,x,y,name}]  selectedId  route: {from:{x,y}}  courier: {x,y}  height
export default function MapView({ pharmacies = [], selectedId, route, courier, height = 'h-72', urgent = false }) {
  const accent = urgent ? '#ff6a33' : '#12b594'
  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border ${height}`} style={{ borderColor: 'var(--border)', background: 'var(--card-solid)' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0H0V6" fill="none" stroke="currentColor" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" className="text-brand-500/20" />
        {/* parks and water */}
        <rect x="6" y="8" width="18" height="14" rx="4" className="fill-brand-400/20" />
        <rect x="70" y="76" width="22" height="16" rx="5" className="fill-brand-400/20" />
        <path d="M0 88 C 25 80, 40 96, 62 90 S 90 84, 100 90 V100 H0Z" className="fill-sky-400/20" />
        {/* streets */}
        <g className="stroke-brand-500/35" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke">
          <path d="M0 58 H100" strokeWidth="5" vectorEffect="non-scaling-stroke" />
          <path d="M50 0 V100" strokeWidth="5" vectorEffect="non-scaling-stroke" />
          <path d="M0 30 C 30 36, 60 24, 100 34" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M28 0 C 30 40, 24 70, 34 100" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M78 0 C 70 30, 84 60, 76 100" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </g>
        {route && (
          <>
            <motion.path
              d={`M${route.from.x} ${route.from.y} L ${route.from.x} ${USER_POS.y} L ${USER_POS.x} ${USER_POS.y}`}
              fill="none"
              stroke={accent}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 7"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
          </>
        )}
      </svg>

      {pharmacies.map((p, i) => {
        const active = p.id === selectedId
        return (
          <div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: active ? 20 : 10 }}>
            <motion.div
              initial={{ scale: 0, y: -16, opacity: 0 }}
              animate={{ scale: active ? 1.25 : 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.1 + i * 0.08 }}
              className="relative"
            >
              {active && <span className="absolute inset-0 animate-pulseRing rounded-full" style={{ background: accent, opacity: 0.4 }} />}
              <div
                className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-white text-white shadow-lg"
                style={{ background: active ? accent : '#0a9279' }}
                title={p.name}
              >
                <Cross size={16} strokeWidth={3} />
              </div>
            </motion.div>
          </div>
        )
      })}

      {/* user marker */}
      <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${USER_POS.x}%`, top: `${USER_POS.y}%` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.3 }} className="relative">
          <span className="absolute inset-0 animate-pulseRing rounded-full bg-sky-500/50" />
          <div className="relative grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-sky-500 text-white shadow-lg">
            <Home size={18} />
          </div>
        </motion.div>
      </div>

      {courier && (
        <motion.div
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
          animate={{ left: `${courier.x}%`, top: `${courier.y}%` }}
          transition={{ duration: 1.1, ease: 'linear' }}
        >
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="relative">
            <span className="absolute inset-0 animate-pulseRing rounded-full" style={{ background: accent, opacity: 0.45 }} />
            <div className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-white text-white shadow-xl" style={{ background: accent }}>
              <Bike size={20} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
