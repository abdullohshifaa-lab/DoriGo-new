
import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, Zap, ClipboardList, User } from 'lucide-react'
import Logo from './Logo.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { useApp } from '../store/AppContext.jsx'

export function useNavItems() {
  const { t } = useApp()
  return [
    { to: '/', label: t.nav.home, Icon: Home, end: true },
    { to: '/search', label: t.nav.search, Icon: Search },
    { to: '/urgent', label: t.nav.urgent, Icon: Zap, urgent: true },
    { to: '/orders', label: t.nav.orders, Icon: ClipboardList },
    { to: '/profile', label: t.nav.profile, Icon: User },
  ]
}

export function TopNav() {
  const items = useNavItems()

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <div className="glass mx-auto flex max-w-5xl items-center justify-between rounded-3xl px-4 py-2.5 shadow-soft">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map(({ to, label, Icon, end, urgent }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="relative rounded-2xl px-4 py-2 text-sm font-semibold"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="top-pill"
                      className={`absolute inset-0 rounded-2xl ${urgent ? 'bg-urgent-500/15' : 'bg-brand-500/15'}`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 ${isActive ? (urgent ? 'text-urgent-500' : 'text-brand-600 dark:text-brand-300') : 'text-muted'}`}>
                    <Icon size={17} /> {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/panel"
            className="rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            Kirish
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export function BottomNav() {
  const items = useNavItems()

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="glass flex items-center justify-around rounded-3xl p-1.5 shadow-soft">
        {items.map(({ to, label, Icon, end, urgent }) => (
          <NavLink key={to} to={to} end={end} className="relative flex-1">
            {({ isActive }) => (
              <motion.div whileTap={{ scale: 0.9 }} className="relative flex flex-col items-center gap-0.5 rounded-2xl py-2">
                {isActive && (
                  <motion.span
                    layoutId="bottom-pill"
                    className={`absolute inset-0 rounded-2xl ${urgent ? 'bg-urgent-500/15' : 'bg-brand-500/15'}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={20} className={`relative ${isActive ? (urgent ? 'text-urgent-500' : 'text-brand-600 dark:text-brand-300') : urgent ? 'text-urgent-400' : 'text-muted'}`} />
                <span className={`relative text-[10px] font-semibold ${isActive ? (urgent ? 'text-urgent-500' : 'text-brand-600 dark:text-brand-300') : 'text-muted'}`}>
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
