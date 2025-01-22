import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ClienteDashboard from './pages/ClienteDashboard'
import FuncionarioDashboard from './pages/FuncionarioDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

const App = () => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cliente" element={<ClienteDashboard />} />
        <Route path="/funcionario" element={<FuncionarioDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
