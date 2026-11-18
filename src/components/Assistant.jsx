import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, ShieldAlert, X } from 'lucide-react'
import { normalize, formatSom } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

// Words that indicate a medical-advice request. The assistant must NOT diagnose or prescribe.
const MEDICAL_ADVICE = ['tashxis', 'kasal', 'qanday dori', 'nima ichsam', 'nima icha', 'doza', 'dozasi', 'necha dona', 'retsept yoz', 'davolash', 'davolay', 'simptom', 'alomat', 'bolamga', 'homilador', 'tuzalaman', 'diagnos', 'prescribe', 'xavfsiz foydalanish', 'yon tasir', 'qanday foydalan', 'foydalanish bo‘yicha']

function findMedicineInText(text, medicines) {
  const words = normalize(text).split(/[^a-zа-я0-9]+/i).filter(Boolean)
  return medicines.find((m) =>
    [m.name, ...m.aliases].some((n) => {
      const stem = normalize(n).slice(0, Math.min(6, normalize(n).length))
      return stem.length >= 4 && words.some((w) => w.startsWith(stem))
    }),
  )
}

export default function Assistant() {
  const nav = useNavigate()
  const { t, orders, lookupMedicine, medicines } = useApp()
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState([{ from: 'bot', text: t.assistant.hello }])
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing, open])

  const reply = (text) => {
    const lower = normalize(text)
    if (MEDICAL_ADVICE.some((w) => lower.includes(w))) {
      return { text: t.assistant.safety, safety: true }
    }
    const med = findMedicineInText(text, medicines)
    if (med) {
      const price = Number(med.unitPrice || Object.values(med.stock || {}).find(Boolean) || 0)
      const description = med.desc?.trim() || 'Bu dori uchun katalogda tavsif mavjud emas.'
      const priceText = price > 0 ? `Katalogdagi narxi: ${formatSom(price)} so‘m.` : 'Katalogda narxi ko‘rsatilmagan.'
      return {
        text: `${med.name}. ${description} ${priceText} Bu ma’lumot faqat Dorigo katalogidan olindi; tashxis yoki dori buyurish emas.`,
        action: { label: t.nav.search, to: `/results?q=${encodeURIComponent(med.name)}` },
      }
    }
    if (/shoshil|tez|urgent|срочно/.test(lower)) {
      return { text: 'Shoshilinch rejimda eng yaqin dorixona va eng tez kuryer tanlanadi.', action: { label: t.home.urgentCta, to: '/urgent' } }
    }
    if (/buyurtma|qayerda|kuzat|order/.test(lower)) {
      const active = orders.find((o) => o.workflow ? !['delivered', 'cancelled'].includes(o.stage) : o.status < 4)
      if (active) return { text: `${active.medicineName || lookupMedicine(active.medicineId)?.name || 'Dori'} buyurtmangiz: ${active.stage ? ({new:'Yangi buyurtma',accepted:'Dorixona qabul qildi',preparing:'Dori tayyorlanmoqda',ready:'Kuryerga topshirildi',courier_accepted:'Kuryerga topshirildi',delivering:'Kuryer yetkazib bermoqda'}[active.stage] || active.stage) : 'jarayonda'}.`, action: { label: t.track.title, to: `/track/${active.id}` } }
      return { text: t.track.noOrder + '.', action: { label: t.nav.orders, to: '/orders' } }
    }
    return { text: 'Dori nomini yozing — men yaqin dorixonalardan topib beraman. Masalan: “Ibuprofen qayerda bor?”' }
  }

  const send = (text) => {
    const v = text.trim()
    if (!v) return
    setMsgs((m) => [...m, { from: 'me', text: v }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { from: 'bot', ...reply(v) }])
    }, 800)
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 16 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={t.assistant.title}
        className="fixed bottom-28 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-brand-600 text-white shadow-xl shadow-brand-500/40 md:bottom-6 md:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'b'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
            {open ? <X size={24} /> : <Bot size={26} />}
          </motion.span>
        </AnimatePresence>
        {!open && <span className="absolute inset-0 animate-pulseRing rounded-full bg-sky-400/40" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            style={{ transformOrigin: 'bottom right', background: 'var(--card-solid)' }}
            className="glass fixed inset-x-3 bottom-48 z-50 flex max-h-[65vh] flex-col overflow-hidden rounded-3xl shadow-2xl md:inset-x-auto md:bottom-24 md:right-6 md:w-96"
          >
            <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-brand-600 text-white"><Bot size={20} /></span>
              <div>
                <div className="font-bold leading-tight">{t.assistant.title}</div>
                <div className="text-xs text-muted">{t.assistant.sub}</div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === 'me' ? 'rounded-br-md bg-gradient-to-br from-brand-400 to-brand-600 text-white' : 'rounded-bl-md bg-brand-500/10'}`}>
                    {m.safety && <ShieldAlert size={16} className="mb-1 text-amber-500" />}
                    {m.text}
                    {m.action && (
                      <button onClick={() => { nav(m.action.to); setOpen(false) }} className="mt-2 block rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white">
                        {m.action.label}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-1 pl-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-2 w-2 rounded-full bg-brand-500" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} />
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {t.assistant.quick.map((q) => (
                <button key={q} onClick={() => send(q)} className="glass rounded-full px-3 py-1 text-xs font-semibold">{q}</button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-center gap-2 border-t p-3" style={{ borderColor: 'var(--border)' }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.assistant.placeholder} className="input py-3 text-sm" />
              <motion.button whileTap={{ scale: 0.88 }} type="submit" className="btn-primary shrink-0 px-4 py-3" aria-label="Send"><Send size={17} /></motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
