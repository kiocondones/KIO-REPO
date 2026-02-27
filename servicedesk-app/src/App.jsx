import { Routes, Route, Navigate, useNavigate} from 'react-router-dom'
import {useEffect} from 'react'

import Login from './pages/Login'
import ServiceDeskLanding from './pages/ServiceDeskLanding'
import DashboardSectionA from './pages/DashboardSectionA'
import Request from './pages/Request'
import SectionB from './pages/SectionB'
import SectionC from './pages/SectionC'
import SectionD from './pages/SectionD'
import SectionE from './pages/SectionE'
import TicketIntake from './pages/TicketIntake'
import AdminSettings from './pages/AdminSettings'
import Analytics from './pages/Analytics'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('accessToken');
    const currentPath = window.location.pathname;

    // If user is logged in /login route is not available
    if (storedUser && currentPath === "/login" ) {
      navigate('/servicedesk');
    } else if (!storedUser && currentPath !== "/login") {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Routes>
    <Route path="/" element={<ServiceDeskLanding />} />
    <Route path="/login" element={<Login />} />
    <Route path="/servicedesk" element={<ServiceDeskLanding />} />
    <Route path="/dashboard" element={<DashboardSectionA />} />
    <Route path="/requests" element={<Request />} />
    <Route path="/section-b" element={<SectionB />} />
    <Route path="/section-c" element={<SectionC />} />
    <Route path="/section-d" element={<SectionD />} />
    <Route path="/section-e" element={<SectionE />} />
    <Route path="/ticket-intake" element={<TicketIntake />} />
    <Route path="/admin" element={<AdminSettings />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  )
}

export default App
