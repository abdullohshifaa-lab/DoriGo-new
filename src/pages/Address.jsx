import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, Building2, Loader2, LocateFixed, MapPin, Phone, User } from 'lucide-react'
import { PageHeader } from '../components/Ui.jsx'
import { deliveryFee, etaRange, pharmacies } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

export default function Address() {
  const nav = useNavigate()
  const { t, flow, profile, createOrder, medicines } = useApp()
  const medicine = medicines.find((m) => m.id === flow.medicineId)
  const pharmacy = pharmacies.find((p) => p.id === flow.pharmacyId)

  const [form, setForm] = useState({ name: profile.name || '', phone: profile.phone || '+998 ', address: profile.address || '', extra: profile.extra || '' })
  const [errors, setErrors] = useState({})
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  if (!medicine || !pharmacy) return <Navigate to="/search" replace />

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const locate = () => {
    setLocating(true)
    setTimeout(() => {
      setForm((f) => ({ ...f, address: 'Amir Temur ko‘chasi, 18' }))
      setErrors((er) => ({ ...er, address: undefined }))
      setLocating(false)
    }, 1100)
  }

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (form.name.trim().length < 2) er.name = t.address.errName
    if (form.phone.replace(/\D/g, '').length < 12) er.phone = t.address.errPhone
    if (form.address.trim().length < 4) er.address = t.address.errAddr
    setErrors(er)
    if (Object.keys(er).length) return

    setSubmitting(true)
    const eta = etaRange(pharmacy, flow.urgent)
    setTimeout(() => {
      const order = createOrder({
        medicine,
        pharmacy,
        qty: flow.qty,
        price: medicine.stock[pharmacy.id],
        fee: deliveryFee(pharmacy, flow.urgent),
        address: form.address.trim(),
        extra: form.extra.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        urgent: flow.urgent,
        etaMin: Math.round((eta.min + eta.max) / 2),
        paymentMethod,
      })
      nav(`/confirmed/${order.id}`, { replace: true })
    }, 900)
  }

  const renderField = ({ id, label, Icon, placeholder, type = 'text', inputMode }) => (
    <motion.div key={id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" />
        <input id={id} type={type} inputMode={inputMode} value={form[id]} onChange={set(id)} placeholder={placeholder} className="input pl-11" style={errors[id] ? { borderColor: '#ef4444' } : undefined} />
      </div>
      <AnimatePresence>
        {errors[id] && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 text-sm font-medium text-red-500">{errors[id]}</motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t.address.title} sub={`${medicine.name} · ${pharmacy.name}`} urgent={flow.urgent} />
      <form onSubmit={submit} className="card space-y-4 p-5 md:p-7" noValidate>
        {renderField({ id: 'name', label: t.address.name, Icon: User, placeholder: t.address.namePh })}
        {renderField({ id: 'phone', label: t.address.phone, Icon: Phone, placeholder: '+998 90 123 45 67', type: 'tel', inputMode: 'tel' })}
        {renderField({ id: 'address', label: t.address.addr, Icon: MapPin, placeholder: t.address.addrPh })}
        <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={locate} className="btn-ghost w-full text-sm">
          {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} className="text-brand-500" />} {t.address.useLocation}
        </motion.button>
        {renderField({ id: 'extra', label: t.address.extra, Icon: Building2, placeholder: t.address.extraPh })}

        <div className="rounded-2xl bg-brand-500/10 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Banknote size={18} className="text-brand-600" /> To‘lov usuli (demo)</div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setPaymentMethod('cash')} className={`rounded-xl border p-3 text-sm font-semibold ${paymentMethod === 'cash' ? 'border-brand-500 bg-brand-500/10' : ''}`} style={{ borderColor: paymentMethod === 'cash' ? '#12b594' : 'var(--border)' }}>Naqd pul</button><button type="button" onClick={() => setPaymentMethod('card')} className={`rounded-xl border p-3 text-sm font-semibold ${paymentMethod === 'card' ? 'border-brand-500 bg-brand-500/10' : ''}`} style={{ borderColor: paymentMethod === 'card' ? '#12b594' : 'var(--border)' }}>Karta (demo)</button></div><p className="mt-2 text-xs text-muted">Haqiqiy to‘lov olinmaydi va karta ma’lumotlari so‘ralmaydi.</p></div>

        <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} className={`${flow.urgent ? 'btn-urgent' : 'btn-primary'} w-full text-lg`}>
          {submitting ? <Loader2 className="animate-spin" size={20} /> : t.address.confirm}
        </motion.button>
      </form>
    </div>
  )
}
