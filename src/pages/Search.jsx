import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, Pill, TrendingUp } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import { PageHeader } from '../components/Ui.jsx'
import { popularSearches } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function Search() {
  const nav = useNavigate()
  const { t, recent, rememberSearch } = useApp()
  const go = (q) => {
    rememberSearch(q)
    nav(`/results?q=${encodeURIComponent(q)}`)
  }

  const Group = ({ title, Icon, items }) => (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted"><Icon size={16} /> {title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((p, i) => (
          <motion.button
            key={p}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => go(p)}
            className="card flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold"
          >
            <Pill size={16} className="text-brand-500" /> {p}
          </motion.button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.search.title} back={false} />
      <SearchBar onSubmit={go} placeholder={t.search.placeholder} cta={t.home.cta} autoFocus />
      {recent.length > 0 && <Group title={t.search.recent} Icon={Clock} items={recent} />}
      <Group title={t.search.suggestions} Icon={TrendingUp} items={popularSearches} />
    </div>
  )
}
