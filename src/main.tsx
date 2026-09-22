import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from './router'
import './index.css'
import './public.css'
import './business.css'
import './brand.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
