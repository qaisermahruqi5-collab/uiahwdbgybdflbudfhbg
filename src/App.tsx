import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import HeroPage from './pages/HeroPage'
import AboutPage from './pages/AboutPage'
import ProgramsPage from '@/pages/ProgramsPage'
import FaqPage from '@/pages/FaqPage'
import NewsPage from '@/pages/NewsPage'
import CalendarPage from '@/pages/CalendarPage'
import RegistrationPage from './pages/RegistrationPage'
import PrivacyPage from '@/pages/PrivacyPage'
import NotFoundPage from '@/pages/NotFoundPage'

/**
 * `/join` was the registration route before this rebuild, and links to it
 * are already out in the world (WhatsApp messages, the Telegram bot, older
 * printed material). Redirect rather than 404, and carry the query string
 * across so a pre-selection survives the hop.
 */
function JoinRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/register', search, hash }} replace />
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/join" element={<JoinRedirect />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
