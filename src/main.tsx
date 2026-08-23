import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/bebas-neue/index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/cairo/400.css'
import '@fontsource/cairo/600.css'
import '@fontsource/cairo/700.css'
import './index.css'
import App from './App.tsx'
import LanguageProvider from './i18n/LanguageProvider.tsx'
import { startPresence } from './lib/presence'

// Anonymous presence light for the academy's own dashboard. No cookies, no
// IP stored, nothing that outlives the tab — see src/lib/presence.ts.
startPresence()

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </HashRouter>,
)
