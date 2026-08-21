import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HeroPage from './pages/HeroPage'
import AboutPage from './pages/AboutPage'
import ProgramsPage from '@/pages/ProgramsPage'
import NewsPage from '@/pages/NewsPage'
import CalendarPage from '@/pages/CalendarPage'
import RegistrationPage from './pages/RegistrationPage'
import PrivacyPage from '@/pages/PrivacyPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/join" element={<RegistrationPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
