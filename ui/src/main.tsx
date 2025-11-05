import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Garage from './pages/Garage.tsx'
import Career from './pages/Career.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/career/:level" element={<Career />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
