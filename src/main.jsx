import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AcademicDashboard from './components/Dashboard/AcademicDashboard'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AcademicDashboard />
  </StrictMode>
)