import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Consulta } from '../types'
import { useNavigate } from 'react-router-dom'
import ConsultaForm from '../components/ConsultaForm'
import ConsultaTable from '../components/ConsultaTable'

const ClienteDashboard = () => {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [minhasConsultas, setMinhasConsultas] = useState<Consulta[]>([])
  const [showConsultaForm, setShowConsultaForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      // Buscar usuário logado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Buscar todas as consultas
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas')
        .select('*')
        .order('data', { ascending: true })

      if (consultasError) throw consultasError
      setConsultas(consultasData || [])

      // Buscar minhas consultas usando o email do usuário
      const { data: minhasConsultasData, error: minhasConsultasError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_email', user.email)  // Usando paciente_email em vez de user_id
        .order('data', { ascending: true })

      if (minhasConsultasError) throw minhasConsultasError
      setMinhasConsultas(minhasConsultasData || [])

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNovaConsulta = async (consultaData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('consultas')
        .insert([{
          ...consultaData,
          paciente_email: user.email,  // Usando paciente_email
          paciente_nome: user.user_metadata.name || user.email,
          status: 'pendente'
        }])

      if (error) throw error

      await fetchData()
      setShowConsultaForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/')
    } catch (err) {
      setError('Erro ao fazer logout')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Painel do Cliente</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowConsultaForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Nova Consulta
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

        {/* Consultas Disponíveis */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Consultas Disponíveis</h2>
          <ConsultaTable 
            consultas={consultas}
            onAction={() => {}}
            loading={loading}
          />
        </div>

        {/* Minhas Consultas */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Minhas Consultas</h2>
          <ConsultaTable 
            consultas={minhasConsultas}
            onAction={() => {}}
            loading={loading}
          />
        </div>
      </main>

      {/* Modal de Nova Consulta */}
      {showConsultaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Nova Consulta</h2>
              <button
                onClick={() => setShowConsultaForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <ConsultaForm
                onClose={() => setShowConsultaForm(false)}
                onSubmit={handleNovaConsulta}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClienteDashboard
