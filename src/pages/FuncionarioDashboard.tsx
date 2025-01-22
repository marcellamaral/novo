import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ConsultaTable from '../components/ConsultaTable'
import ProfileModal from '../components/ProfileModal'
import { Consulta } from '../types'

const FuncionarioDashboard = () => {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Buscar consultas
  const fetchConsultas = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .order('data', { ascending: true })

      if (error) throw error
      setConsultas(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/')
    } catch (err) {
      setError('Erro ao fazer logout')
    }
  }

  // Ações nas consultas
  const handleConsultaAction = async (action: string, consulta: Consulta) => {
    try {
      let updatedStatus = consulta.status
      
      switch (action) {
        case 'approve':
          updatedStatus = 'aprovada'
          break
        case 'reject':
          updatedStatus = 'rejeitada'
          break
        case 'reschedule':
          // Implementar lógica de remarcação
          break
        case 'delete':
          const { error: deleteError } = await supabase
            .from('consultas')
            .delete()
            .eq('id', consulta.id)
          if (deleteError) throw deleteError
          setConsultas(prev => prev.filter(c => c.id !== consulta.id))
          return
        default:
          return
      }

      const { error } = await supabase
        .from('consultas')
        .update({ status: updatedStatus })
        .eq('id', consulta.id)

      if (error) throw error

      setConsultas(prev => 
        prev.map(c => 
          c.id === consulta.id ? { ...c, status: updatedStatus } : c
        )
      )
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchConsultas()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Painel do Funcionário</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                👤
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Consultas Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Consultas</h2>
          </div>
          <ConsultaTable
            consultas={consultas}
            onAction={handleConsultaAction}
            loading={loading}
          />
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}

export default FuncionarioDashboard
