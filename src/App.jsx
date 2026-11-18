
import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import FloatingBg from './components/FloatingBg.jsx'
import { BottomNav, TopNav } from './components/Navbar.jsx'
import PageTransition from './components/PageTransition.jsx'
import Assistant from './components/Assistant.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Results from './pages/Results.jsx'
import Details from './pages/Details.jsx'
import Address from './pages/Address.jsx'
import Confirmation from './pages/Confirmation.jsx'
import Tracking from './pages/Tracking.jsx'
import History from './pages/History.jsx'
import Profile from './pages/Profile.jsx'
import Urgent from './pages/Urgent.jsx'
import Panel from './pages/Panel.jsx'

const page = (El) => <PageTransition><El /></PageTransition>

function getVisitorId() {
  let id = sessionStorage.getItem('dg_visitor_id')

  if (!id) {
    id = window.crypto?.randomUUID?.() ||
      `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`

    sessionStorage.setItem('dg_visitor_id', id)
  }

  return id
}

function saveVisit(path) {
  try {
    const visitorId = getVisitorId()
    const visits = JSON.parse(localStorage.getItem('dg_analytics_visits') || '[]')

    visits.push({
      id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      visitorId,
      page: path,
      visitedAt: Date.now(),
    })

    localStorage.setItem(
      'dg_analytics_visits',
      JSON.stringify(visits.slice(-5000))
    )
  } catch (error) {
    console.error('DORIGO analytics error:', error)
  }
}

export default function App() {
  const location = useLocation()
  const isPanel = location.pathname.startsWith('/panel')
  const lastTrackedPath = useRef('')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    if (isPanel || lastTrackedPath.current === location.pathname) return

    lastTrackedPath.current = location.pathname
    saveVisit(location.pathname)
  }, [location.pathname, isPanel])

  return <>
    <FloatingBg />

    {!isPanel && <TopNav />}

    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={page(Home)} />
        <Route path="/search" element={page(Search)} />
        <Route path="/results" element={page(Results)} />
        <Route path="/details" element={page(Details)} />
        <Route path="/address" element={page(Address)} />
        <Route path="/confirmed/:id" element={page(Confirmation)} />
        <Route path="/track/:id" element={page(Tracking)} />
        <Route path="/orders" element={page(History)} />
        <Route path="/profile" element={page(Profile)} />
        <Route path="/urgent" element={page(Urgent)} />
        <Route path="/panel/*" element={page(Panel)} />
        <Route path="*" element={page(Home)} />
      </Routes>
    </AnimatePresence>

    {!isPanel && <><BottomNav /><Assistant /></>}
  </>
}
