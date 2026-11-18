
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowLeft, Bot, Boxes, CheckCircle2, Clock3,
  LogOut, PackageCheck, Plus, ShieldCheck, Store, Truck,
  Wallet, XCircle, Users, Eye, ClipboardList, BarChart3
} from 'lucide-react'
import { formatSom } from '../data/mock.js'
import { useApp } from '../store/AppContext.jsx'

const ACTIVE_STAGES = ['new', 'accepted', 'preparing', 'ready', 'courier_accepted', 'delivering']

const statusTone = (stage) =>
  stage === 'delivered'
    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
    : stage === 'cancelled'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
      : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'

const dateLabel = (n) =>
  n ? new Date(n).toLocaleString('uz-UZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '—'

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

const saveActivity = (action, details = '') => {
  try {
    const logs = readStorage('dg_admin_activity')
    logs.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actor: localStorage.getItem('dg_panel_role') || 'unknown',
      action,
      details,
      timestamp: Date.now()
    })
    localStorage.setItem('dg_admin_activity', JSON.stringify(logs.slice(0, 3000)))
  } catch (error) {
    console.error('Activity log error:', error)
  }
}

export default function Panel() {
  const nav = useNavigate()

  const {
    orders,
    medicines,
    updateMedicine,
    addMedicine,
    deleteMedicine,
    acceptOrder,
    prepareOrder,
    handoffOrder,
    courierAcceptOrder,
    startDelivery,
    completeDelivery,
    cancelOrder,
    stageLabels,
    lookupMedicine
  } = useApp()

  const [role, setRole] = useState(() => localStorage.getItem('dg_panel_role') || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState('orders')
  const [medicineForm, setMedicineForm] = useState({
    name: '', desc: '', price: '', qty: ''
  })
  const [editing, setEditing] = useState(null)
  const [activity, setActivity] = useState(() => readStorage('dg_admin_activity'))
  const [visits, setVisits] = useState(() => readStorage('dg_analytics_visits'))

  const workflowOrders = orders.filter((o) => o.workflow === true)
  const sellerOrders = workflowOrders.filter((o) => ACTIVE_STAGES.includes(o.stage))
  const courierOrders = workflowOrders.filter((o) =>
    ['ready', 'courier_accepted', 'delivering'].includes(o.stage)
  )
  const delivered = workflowOrders.filter((o) => o.stage === 'delivered')
  const cancelled = workflowOrders.filter((o) => o.stage === 'cancelled')
  const lowStock = medicines.filter((m) => Number(m.inventoryQty || 0) <= 5)
  const salesTotal = delivered.reduce((sum, o) => sum + Number(o.total || 0), 0)

  const refreshAdminData = () => {
    setActivity(readStorage('dg_admin_activity'))
    setVisits(readStorage('dg_analytics_visits'))
  }

  const message = (result) => {
    setNotice(result?.message || (
      result?.ok
        ? 'Amal muvaffaqiyatli bajarildi.'
        : 'Amalni bajarib bo‘lmadi.'
    ))
  }

  const runAction = (label, fn, details = '') => {
    const result = fn()
    message(result)

    if (result?.ok) {
      saveActivity(label, details)
      refreshAdminData()
    }

    return result
  }

  const login = (e) => {
    e.preventDefault()

    let nextRole = ''

    if (username.trim() === 'admin' && password === 'dorigo123') {
      nextRole = 'admin'
    } else if (username.trim() === 'dorixona' && password === 'dorigo123') {
      nextRole = 'seller'
    } else if (username.trim() === 'kuryer' && password === 'dorigo123') {
      nextRole = 'courier'
    }

    if (!nextRole) {
      setLoginError('Login yoki parol noto‘g‘ri.')
      return
    }

    localStorage.setItem('dg_panel_role', nextRole)
    setRole(nextRole)
    setLoginError('')
    setNotice('')
    setTab(nextRole === 'admin' ? 'dashboard' : 'orders')
    saveActivity('Panelga kirish', `${nextRole} paneliga kirdi`)
  }

  const logout = () => {
    localStorage.removeItem('dg_panel_role')
    setRole('')
    setUsername('')
    setPassword('')
    nav('/panel')
  }

  const submitMedicine = (e) => {
    e.preventDefault()

    const name = medicineForm.name.trim()
    const desc = medicineForm.desc.trim()
    const price = Number(medicineForm.price)
    const qty = Number(medicineForm.qty)

    if (
      !name ||
      !desc ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(qty) ||
      qty < 0
    ) {
      setNotice('Dori nomi, tavsifi, narxi va qoldig‘ini tekshiring.')
      return
    }

    addMedicine({ name, desc, price, qty })
    saveActivity('Dori qo‘shildi', name)
    refreshAdminData()

    setMedicineForm({ name: '', desc: '', price: '', qty: '' })
    setNotice('Yangi dori katalogga qo‘shildi.')
  }

  const beginEdit = (m) => {
    setEditing({
      id: m.id,
      name: m.name,
      desc: m.desc || '',
      price: String(m.unitPrice || 0),
      qty: String(m.inventoryQty || 0)
    })
  }

  const saveEdit = (e) => {
    e.preventDefault()

    if (
      !editing.name.trim() ||
      Number(editing.price) <= 0 ||
      !Number.isInteger(Number(editing.qty)) ||
      Number(editing.qty) < 0
    ) {
      setNotice('Nom, narx va qoldiqni tekshiring.')
      return
    }

    updateMedicine(editing.id, {
      name: editing.name.trim(),
      desc: editing.desc.trim(),
      unitPrice: Number(editing.price),
      inventoryQty: Number(editing.qty)
    })

    saveActivity('Dori tahrirlandi', editing.name)
    refreshAdminData()

    setEditing(null)
    setNotice('Dori ma’lumotlari yangilandi.')
  }

  const aiTips = useMemo(() => {
    const tips = []

    if (lowStock.length) {
      tips.push(
        `Ombor ogohlantirishi: ${lowStock.map(
          (m) => `${m.name} (${m.inventoryQty} ta)`
        ).join(', ')} — qoldiq 5 ta yoki undan kam.`
      )
    } else {
      tips.push('Omborda kam qolgan dorilar yo‘q.')
    }

    const counts = {}

    workflowOrders
      .filter((o) => o.stage !== 'cancelled')
      .forEach((o) => {
        const name = o.medicineName ||
          lookupMedicine(o.medicineId)?.name ||
          'Dori'

        counts[name] = (counts[name] || 0) + Number(o.qty || 1)
      })

    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

    tips.push(
      best
        ? `Eng ko‘p so‘ralgan dori: ${best[0]} (${best[1]} dona).`
        : 'Talabni tahlil qilish uchun buyurtmalar kerak.'
    )

    const waiting = workflowOrders.filter((o) =>
      ['new', 'accepted', 'preparing'].includes(o.stage)
    ).length

    tips.push(
      waiting
        ? `${waiting} ta buyurtma hali kuryerga topshirilmagan.`
        : 'Kuryerga topshirilmagan buyurtmalar yo‘q.'
    )

    return tips
  }, [lowStock, workflowOrders, lookupMedicine])

  // Admin statistikasi
  const uniqueVisitors = new Set(visits.map((v) => v.visitorId).filter(Boolean)).size

  const pageCounts = visits.reduce((acc, visit) => {
    const page = visit.page || 'Noma’lum sahifa'
    acc[page] = (acc[page] || 0) + 1
    return acc
  }, {})

  const popularPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])

  const recentOrders = [...workflowOrders].sort(
    (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)
  )

  const roleName = (value) => ({
    admin: 'Admin',
    seller: 'Sotuvchi',
    courier: 'Kuryer',
    customer: 'Mijoz',
    unknown: 'Noma’lum'
  }[value] || value || 'Noma’lum')

  // Kirish oynasi
  if (!role) {
    return (
      <div className="mx-auto max-w-lg px-1 py-6 md:py-12">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={16} />
          Mijozlar sahifasiga qaytish
        </Link>

        <div className="card overflow-hidden p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg">
              <ShieldCheck size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold text-brand-600">DORIGO · DEMO</p>
              <h1 className="text-2xl font-extrabold">Boshqaruv paneli</h1>
              <p className="text-sm text-muted">Xodim yoki admin sifatida kiring</p>
            </div>
          </div>

          <form onSubmit={login} className="space-y-4">
            <label className="block text-sm font-semibold">
              Login
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input mt-1.5"
                autoComplete="username"
                placeholder="Login"
              />
            </label>

            <label className="block text-sm font-semibold">
              Parol
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1.5"
                type="password"
                autoComplete="current-password"
                placeholder="Parol"
              />
            </label>

            {loginError && (
              <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600">
                {loginError}
              </p>
            )}

            <button className="btn-primary w-full" type="submit">
              Panelga kirish
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
              <div className="mb-2 flex items-center gap-2 font-bold">
                <ShieldCheck size={17} className="text-brand-500" />
                Admin
              </div>
              <p className="text-sm text-muted">Login: <b>admin</b></p>
              <p className="text-sm text-muted">Parol: <b>dorigo123</b></p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <Store size={17} className="text-brand-500" />
                  Sotuvchi
                </div>
                <p className="text-sm text-muted">Login: <b>dorixona</b></p>
                <p className="text-sm text-muted">Parol: <b>dorigo123</b></p>
              </div>

              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <Truck size={17} className="text-brand-500" />
                  Kuryer
                </div>
                <p className="text-sm text-muted">Login: <b>kuryer</b></p>
                <p className="text-sm text-muted">Parol: <b>dorigo123</b></p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted">
            Demo versiya: ma’lumotlar shu brauzerda saqlanadi.
            Bu loginlar haqiqiy xavfsiz autentifikatsiya o‘rnini bosmaydi.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-10">
      <header className="card flex flex-wrap items-center justify-between gap-4 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
            {role === 'admin'
              ? <ShieldCheck size={24} />
              : role === 'seller'
                ? <Store size={24} />
                : <Truck size={24} />}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">
              Dorigo boshqaruv
            </div>

            <h1 className="text-2xl font-extrabold">
              {role === 'admin'
                ? 'Admin panel'
                : role === 'seller'
                  ? 'Sotuvchi paneli'
                  : 'Kuryer paneli'}
            </h1>

            <p className="text-sm text-muted">
              {role === 'admin'
                ? 'Sayt statistikasi va boshqaruv'
                : role === 'seller'
                  ? 'Buyurtmalar, katalog va ombor nazorati'
                  : 'Yetkazish jarayoni va buyurtmalar tarixi'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="chip bg-brand-500/10 text-brand-700 dark:text-brand-300">
            Demo rejim
          </span>

          <button className="btn-ghost px-3 py-2.5 text-sm" onClick={logout}>
            <LogOut size={16} />
            Chiqish
          </button>
        </div>
      </header>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4 text-sm">
          <span>{notice}</span>
          <button aria-label="Yopish" onClick={() => setNotice('')}>
            <XCircle size={17} />
          </button>
        </div>
      )}

      {/* ADMIN PANEL */}
      {role === 'admin' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              icon={<Users size={21} />}
              label="Tashrifchilar"
              value={uniqueVisitors}
              sub="Brauzer sessiyalari bo‘yicha"
            />

            <Stat
              icon={<Eye size={21} />}
              label="Sahifa ko‘rishlar"
              value={visits.length}
              sub="Qayd etilgan tashriflar"
            />

            <Stat
              icon={<ClipboardList size={21} />}
              label="Buyurtmalar"
              value={workflowOrders.length}
              sub="Jami demo buyurtmalar"
            />

            <Stat
              icon={<XCircle size={21} />}
              label="Bekor qilingan"
              value={cancelled.length}
              sub="Bekor qilingan buyurtmalar"
              warn={cancelled.length > 0}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat
              icon={<CheckCircle2 size={21} />}
              label="Yetkazilgan"
              value={delivered.length}
              sub="Yakunlangan buyurtmalar"
            />

            <Stat
              icon={<Clock3 size={21} />}
              label="Faol buyurtmalar"
              value={sellerOrders.length}
              sub="Jarayondagi buyurtmalar"
            />

            <Stat
              icon={<Wallet size={21} />}
              label="Savdo summasi"
              value={`${formatSom(salesTotal)} so‘m`}
              sub="Yetkazilgan buyurtmalar"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Umumiy statistika' },
              { id: 'visitors', label: 'Tashriflar' },
              { id: 'adminOrders', label: 'Buyurtmalar' },
              { id: 'activity', label: 'Faoliyat tarixi' }
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => {
                  setTab(x.id)
                  refreshAdminData()
                }}
                className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                  tab === x.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'glass'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {tab === 'dashboard' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="card space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <BarChart3 size={21} className="text-brand-500" />
                  <h2 className="text-lg font-extrabold">Eng ko‘p ko‘rilgan sahifalar</h2>
                </div>

                {popularPages.length ? popularPages.map(([page, count]) => (
                  <div key={page}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span className="font-semibold">{page}</span>
                      <span className="text-muted">{count} ta ko‘rish</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-brand-500/10">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${Math.max(3, count / popularPages[0][1] * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )) : (
                  <Empty
                    icon={<Eye size={25} />}
                    title="Tashriflar hali yo‘q"
                    text="Mijozlar sayt sahifalariga kirgach, statistika shu yerda ko‘rinadi."
                  />
                )}
              </section>

              <section className="card space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <Activity size={21} className="text-brand-500" />
                  <h2 className="text-lg font-extrabold">So‘nggi faoliyat</h2>
                </div>

                {activity.length ? activity.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border p-3"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <b className="text-sm">{item.action}</b>
                      <span className="text-xs text-muted">
                        {dateLabel(item.timestamp)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      {roleName(item.actor)} · {item.details || '—'}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-muted">
                    Hozircha faoliyat qayd etilmagan.
                  </p>
                )}
              </section>
            </div>
          )}

          {tab === 'visitors' && (
            <section className="card space-y-4 p-5">
              <div>
                <h2 className="text-xl font-extrabold">Sayt tashriflari</h2>
                <p className="text-sm text-muted">
                  Brauzer sessiyasi va ko‘rilgan sahifalar bo‘yicha statistika
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Stat
                  icon={<Users size={21} />}
                  label="Noyob sessiyalar"
                  value={uniqueVisitors}
                  sub="Visitor ID bo‘yicha"
                />

                <Stat
                  icon={<Eye size={21} />}
                  label="Jami ko‘rishlar"
                  value={visits.length}
                  sub="Qayd etilgan sahifalar"
                />
              </div>

              {visits.length ? (
                <div className="space-y-2">
                  {[...visits].sort((a, b) => b.visitedAt - a.visitedAt).slice(0, 100).map((v, i) => (
                    <div
                      key={v.id || i}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div>
                        <p className="font-semibold">{v.page}</p>
                        <p className="text-xs text-muted">
                          Sessiya: {v.visitorId || 'Noma’lum'}
                        </p>
                      </div>

                      <span className="text-xs text-muted">
                        {dateLabel(v.visitedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  icon={<Eye size={25} />}
                  title="Hali tashrif qayd etilmagan"
                  text="Saytga mijoz sifatida kirib sahifalarni ochib ko‘ring."
                />
              )}

              <p className="text-xs text-muted">
                Eslatma: bu ro‘yxat haqiqiy odamning ismi yoki telefonini ko‘rsatmaydi.
                Bir brauzer sessiyasidagi tashriflarni hisoblaydi.
              </p>
            </section>
          )}

          {tab === 'adminOrders' && (
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold">Barcha buyurtmalar</h2>

              {recentOrders.length ? recentOrders.map((o) => (
                <OrderCard key={o.id} order={o} />
              )) : (
                <Empty
                  icon={<PackageCheck size={28} />}
                  title="Buyurtmalar yo‘q"
                  text="Mijozlar buyurtma berganidan keyin shu yerda ko‘rinadi."
                />
              )}
            </section>
          )}

          {tab === 'activity' && (
            <section className="card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Faoliyat tarixi</h2>
                  <p className="text-sm text-muted">
                    Panelda qayd etilgan xodim harakatlari
                  </p>
                </div>

                <button className="btn-ghost px-3 py-2 text-sm" onClick={refreshAdminData}>
                  Yangilash
                </button>
              </div>

              {activity.length ? activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b>{item.action}</b>
                    <span className="text-xs text-muted">
                      {dateLabel(item.timestamp)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-muted">
                    Kim: {roleName(item.actor)}
                  </p>

                  <p className="text-sm">
                    Nima qildi: {item.details || '—'}
                  </p>
                </div>
              )) : (
                <Empty
                  icon={<Activity size={28} />}
                  title="Faoliyat tarixi bo‘sh"
                  text="Xodimlar panelda amallar bajargach, ular shu yerda qayd etiladi."
                />
              )}
            </section>
          )}
        </>
      )}

      {/* SOTUVCHI PANELI */}
      {role === 'seller' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              icon={<Activity size={21} />}
              label="Buyurtmalar"
              value={workflowOrders.length}
              sub="Barcha demo buyurtmalar"
            />

            <Stat
              icon={<Wallet size={21} />}
              label="Savdo summasi"
              value={`${formatSom(salesTotal)} so‘m`}
              sub="Faqat yetkazilgan buyurtmalar"
            />

            <Stat
              icon={<CheckCircle2 size={21} />}
              label="Yetkazilgan"
              value={delivered.length}
              sub="Yakunlangan buyurtmalar"
            />

            <Stat
              icon={<Boxes size={21} />}
              label="Kam qolgan dorilar"
              value={lowStock.length}
              sub="5 ta yoki undan kam"
              warn={lowStock.length > 0}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'Buyurtmalar' },
              { id: 'catalog', label: 'Dorilar va ombor' },
              { id: 'ai', label: 'AI tavsiyalari' },
              { id: 'history', label: 'Tarix' }
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                  tab === x.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'glass'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            <section className="space-y-3">
              {sellerOrders.length === 0 ? (
                <Empty
                  icon={<PackageCheck size={28} />}
                  title="Hozircha buyurtma yo‘q"
                  text="Mijozlar sahifasidan yangi buyurtma yarating."
                />
              ) : sellerOrders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onCancel={() => {
                    if (window.confirm('Buyurtmani bekor qilmoqchimisiz?')) {
                      runAction('Buyurtma bekor qilindi', () => cancelOrder(o.id), o.id)
                    }
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    {o.stage === 'new' && (
                      <button
                        className="btn-primary px-4 py-2.5 text-sm"
                        onClick={() => runAction('Buyurtma qabul qilindi', () => acceptOrder(o.id), o.id)}
                      >
                        Qabul qilish
                      </button>
                    )}

                    {o.stage === 'accepted' && (
                      <button
                        className="btn-primary px-4 py-2.5 text-sm"
                        onClick={() => runAction('Dorilar tayyorlanmoqda', () => prepareOrder(o.id), o.id)}
                      >
                        Dorilarni tayyorlash
                      </button>
                    )}

                    {o.stage === 'preparing' && (
                      <button
                        className="btn-primary px-4 py-2.5 text-sm"
                        onClick={() => runAction('Buyurtma kuryerga topshirildi', () => handoffOrder(o.id), o.id)}
                      >
                        Kuryerga topshirish
                      </button>
                    )}
                  </div>
                </OrderCard>
              ))}
            </section>
          )}

          {tab === 'catalog' && (
            <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
              <form onSubmit={submitMedicine} className="card h-fit space-y-3 p-5">
                <h2 className="text-lg font-extrabold">Yangi dori qo‘shish</h2>

                <Field
                  label="Dori nomi"
                  value={medicineForm.name}
                  onChange={(v) => setMedicineForm((f) => ({ ...f, name: v }))}
                  placeholder="Masalan: Vitamin C"
                />

                <Field
                  label="Tavsif"
                  value={medicineForm.desc}
                  onChange={(v) => setMedicineForm((f) => ({ ...f, desc: v }))}
                  placeholder="Katalogda ko‘rinadigan tavsif"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Narxi (so‘m)"
                    type="number"
                    value={medicineForm.price}
                    onChange={(v) => setMedicineForm((f) => ({ ...f, price: v }))}
                  />

                  <Field
                    label="Qoldiq (dona)"
                    type="number"
                    value={medicineForm.qty}
                    onChange={(v) => setMedicineForm((f) => ({ ...f, qty: v }))}
                  />
                </div>

                <button className="btn-primary w-full" type="submit">
                  <Plus size={17} />
                  Dorini qo‘shish
                </button>
              </form>

              <div className="space-y-3">
                {medicines.map((m) => editing?.id === m.id ? (
                  <form
                    key={m.id}
                    onSubmit={saveEdit}
                    className="card space-y-3 p-4"
                  >
                    <h3 className="font-bold">Dorini tahrirlash</h3>

                    <Field
                      label="Nomi"
                      value={editing.name}
                      onChange={(v) => setEditing((x) => ({ ...x, name: v }))}
                    />

                    <Field
                      label="Tavsif"
                      value={editing.desc}
                      onChange={(v) => setEditing((x) => ({ ...x, desc: v }))}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Narxi (so‘m)"
                        type="number"
                        value={editing.price}
                        onChange={(v) => setEditing((x) => ({ ...x, price: v }))}
                      />

                      <Field
                        label="Qoldiq"
                        type="number"
                        value={editing.qty}
                        onChange={(v) => setEditing((x) => ({ ...x, qty: v }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button className="btn-primary px-4 py-2.5 text-sm" type="submit">
                        Saqlash
                      </button>

                      <button
                        className="btn-ghost px-4 py-2.5 text-sm"
                        type="button"
                        onClick={() => setEditing(null)}
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    key={m.id}
                    className="card flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{m.name}</h3>

                        {Number(m.inventoryQty) <= 5 && (
                          <span className="chip bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Kam qoldi
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-muted">{m.desc}</p>

                      <p className="mt-2 text-sm font-bold">
                        {formatSom(m.unitPrice || 0)} so‘m
                        <span className="font-normal text-muted">
                          {' '}· Qoldiq: {m.inventoryQty} ta
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="btn-ghost px-3 py-2 text-sm"
                        onClick={() => beginEdit(m)}
                      >
                        Tahrirlash
                      </button>

                      <button
                        className="rounded-xl border border-rose-500/20 px-3 py-2 text-sm font-semibold text-rose-600"
                        onClick={() => {
                          deleteMedicine(m.id)
                          saveActivity('Dori katalogdan yashirildi', m.name)
                          refreshAdminData()
                          setNotice(`${m.name} katalogdan yashirildi.`)
                        }}
                      >
                        O‘chirish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div className="card p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-600">
                  <Bot size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold">Dorigo sotuvchi AI</h2>
                  <p className="text-sm text-muted">
                    Demo tahlil — faqat sayt ichidagi ma’lumotlar
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {aiTips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-2xl border p-4"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-6">{tip}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted">
                Tavsiyalar demo ma’lumotlariga asoslangan.
              </p>
            </div>
          )}

          {tab === 'history' && (
            <section className="space-y-3">
              {[...delivered, ...cancelled].length === 0 ? (
                <Empty
                  icon={<Clock3 size={28} />}
                  title="Tarix hozircha bo‘sh"
                  text="Buyurtmalar yakunlangach, shu yerda ko‘rinadi."
                />
              ) : [...delivered, ...cancelled]
                .sort((a, b) => (b.deliveredAt || b.cancelledAt || b.createdAt) - (a.deliveredAt || a.cancelledAt || a.createdAt))
                .map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onCancel={o.stage !== 'cancelled' ? () => {
                      if (window.confirm('Buyurtmani bekor qilmoqchimisiz?')) {
                        runAction('Buyurtma bekor qilindi', () => cancelOrder(o.id), o.id)
                      }
                    } : undefined}
                  />
                ))}
            </section>
          )}
        </>
      )}

      {/* KURYER PANELI */}
      {role === 'courier' && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              icon={<Truck size={21} />}
              label="Faol yetkazishlar"
              value={courierOrders.length}
              sub="Qabul qilish yoki yetkazish kerak"
            />

            <Stat
              icon={<CheckCircle2 size={21} />}
              label="Yetkazilgan"
              value={delivered.length}
              sub="Tarixdagi buyurtmalar"
            />

            <Stat
              icon={<Clock3 size={21} />}
              label="Kutilayotgan"
              value={workflowOrders.filter((o) => o.stage === 'ready').length}
              sub="Kuryer qabulini kutmoqda"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'orders', label: 'Yetkazish buyurtmalari' },
              { id: 'history', label: 'Yetkazilganlar tarixi' },
              { id: 'ai', label: 'AI yordamchi' }
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                  tab === x.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'glass'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            <section className="space-y-3">
              {courierOrders.length === 0 ? (
                <Empty
                  icon={<Truck size={28} />}
                  title="Yetkazish buyurtmalari yo‘q"
                  text="Sotuvchi buyurtmani tayyorlab, kuryerga topshirgach, shu yerda paydo bo‘ladi."
                />
              ) : courierOrders.map((o) => (
                <OrderCard key={o.id} order={o} courier>
                  <div className="flex flex-wrap gap-2">
                    {o.stage === 'ready' && (
                      <button
                        className="btn-primary px-4 py-2.5 text-sm"
                        onClick={() => runAction('Kuryer buyurtmani qabul qildi', () => courierAcceptOrder(o.id), o.id)}
                      >
                        Buyurtmani qabul qilish
                      </button>
                    )}

                    {o.stage === 'courier_accepted' && (
                      <button
                        className="btn-primary px-4 py-2.5 text-sm"
                        onClick={() => runAction('Yetkazish boshlandi', () => startDelivery(o.id), o.id)}
                      >
                        Yetkazishni boshlash
                      </button>
                    )}

                    {o.stage === 'delivering' && (
                      <button
                        className="btn-primary px-4 py-2.5 text-sm"
                        onClick={() => runAction('Buyurtma yetkazildi', () => completeDelivery(o.id), o.id)}
                      >
                        Yetkazildi deb belgilash
                      </button>
                    )}
                  </div>
                </OrderCard>
              ))}
            </section>
          )}

          {tab === 'history' && (
            <section className="space-y-3">
              {delivered.length === 0 ? (
                <Empty
                  icon={<CheckCircle2 size={28} />}
                  title="Hali yetkazilgan buyurtma yo‘q"
                  text="Yetkazib berilgan buyurtmalar shu yerda saqlanadi."
                />
              ) : delivered.map((o) => (
                <OrderCard key={o.id} order={o} courier />
              ))}
            </section>
          )}

          {tab === 'ai' && (
            <div className="card p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-600">
                  <Bot size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-extrabold">Kuryer AI yordamchisi</h2>
                  <p className="text-sm text-muted">
                    Buyurtma ma’lumotlariga asoslangan demo maslahat
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {courierOrders.length ? (
                  [...courierOrders]
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .map((o, index) => {
                      const waitMin = Math.max(
                        0,
                        Math.floor((Date.now() - o.createdAt) / 60000)
                      )

                      const risk = waitMin >= 30
                        ? 'Kechikish xavfi yuqoriroq — ustuvor tekshiring.'
                        : 'Hozircha vaqt bo‘yicha aniq kechikish belgisi yo‘q.'

                      return (
                        <div
                          key={o.id}
                          className="rounded-2xl border p-4"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <p className="font-bold">
                            {index === 0 ? 'Birinchi tavsiya · ' : ''}
                            {o.id} · {o.name}
                          </p>

                          <p className="mt-1 text-sm text-muted">
                            Manzil: {o.address}
                          </p>

                          <p className="mt-2 text-sm">
                            Buyurtma {stageLabels[o.stage] || o.stage} holatida.
                            Navbatdagi o‘rni {index + 1}.
                            Kutish: taxminan {waitMin} daqiqa. {risk}
                          </p>
                        </div>
                      )
                    })
                ) : (
                  <Empty
                    icon={<Bot size={26} />}
                    title="Faol buyurtma yo‘q"
                    text="Kuryerga topshirilgan buyurtmalar paydo bo‘lgach, AI ularni tahlil qiladi."
                  />
                )}

                <p className="text-xs text-muted">
                  Haqiqiy GPS yoki xarita marshruti ulanmagan.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ icon, label, value, sub, warn }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-muted">{label}</span>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${
          warn
            ? 'bg-amber-500/15 text-amber-600'
            : 'bg-brand-500/10 text-brand-600'
        }`}>
          {icon}
        </span>
      </div>

      <div className="mt-3 break-words text-2xl font-extrabold">{value}</div>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </div>
  )
}

function Empty({ icon, title, text }) {
  return (
    <div className="card p-9 text-center">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
        {icon}
      </div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{text}</p>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type={type}
        min={type === 'number' ? 0 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input mt-1.5 py-3"
      />
    </label>
  )
}

function OrderCard({ order: o, children, courier = false, onCancel }) {
  const { lookupMedicine, lookupPharmacy, stageLabels } = useApp()
  const med = lookupMedicine(o.medicineId)
  const ph = lookupPharmacy(o.pharmacyId)

  return (
    <article className="card space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold">{o.id}</h3>
            <span className={`chip ${statusTone(o.stage)}`}>
              {stageLabels[o.stage] || 'Eski demo buyurtma'}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted">
            {dateLabel(o.createdAt)} · {o.name}
          </p>
        </div>

        <div className="text-lg font-extrabold">
          {formatSom(o.total)} so‘m
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-brand-500/5 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
            {courier ? 'Yetkazish ma’lumoti' : 'Mijoz va buyurtma'}
          </p>

          <p className="font-semibold">{o.name} · {o.phone}</p>
          <p className="mt-1 text-sm">{o.address}</p>

          {!courier && (
            <p className="mt-2 text-sm font-semibold">
              {o.medicineName || med?.name || 'Dori'} × {o.qty}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-brand-500/5 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
            Dorixona va to‘lov
          </p>

          <p className="font-semibold">
            {o.pharmacyName || ph?.name || 'Dorigo'}
          </p>

          <p className="text-sm text-muted">
            Olib ketish: {o.pharmacyAddress || ph?.address || 'Demo dorixona manzili'}
          </p>

          <p className="mt-2 text-sm">
            To‘lov: <b>{o.paymentMethod === 'card' ? 'Karta (demo)' : 'Naqd pul'}</b>
          </p>
        </div>
      </div>

      {children}

      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-muted"
        style={{ borderColor: 'var(--border)' }}
      >
        <span>
          Yetkazish: {formatSom(o.fee || 0)} so‘m ·
          {' '}{o.stockDeducted ? 'Ombor hisoblangan' : 'Ombor hali kamaytirilmagan'}
        </span>

        {onCancel && (
          <button onClick={onCancel} className="font-semibold text-rose-600">
            Buyurtmani bekor qilish
          </button>
        )}
      </div>
    </article>
  )
}
