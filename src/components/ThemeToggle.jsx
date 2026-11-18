import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useApp } from '../store/AppContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      onClick={toggleTheme}
      aria-label="Mavzuni almashtirish"
      className="glass grid h-11 w-11 place-items-center overflow-hidden rounded-2xl"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 18, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 60, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {theme === 'dark' ? <Sun size={20} className="text-amber-300" /> : <Moon size={20} className="text-brand-700" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
