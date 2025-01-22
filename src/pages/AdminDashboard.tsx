import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import ConsultaTable from '../components/ConsultaTable'
import UserForm from '../components/UserForm'
import ProfissionalForm from '../components/ProfissionalForm'
import StatsPanel from '../components/StatsPanel'
import { Consulta, User, Profissional } from '../types'

const AdminDashboard = () => {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [showProfissionalForm, setShowProfissionalForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Função de logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/')
    } catch (err) {
      setError('Erro ao fazer logout')
    }
  }

  // Verificar permissões de admin
  const checkAdminPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/')
      return null
    }

    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (userData?.user_type !== 'admin') {
      navigate('/')
      return null
    }

    return user
  }

  // Buscar dados
  const fetchData = async () => {
    setLoading(true)
    try {
      await checkAdminPermissions()

      // Buscar consultas
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas')
        .select('*')
        .order('data', { ascending: true })

      if (consultasError) throw consultasError
      setConsultas(consultasData || [])

      // Buscar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      setUsers(usersData || [])

      // Buscar profissionais
      const { data: profissionaisData, error: profissionaisError } = await supabase
        .from('profissionais')
        .select('*')
        .order('created_at', { ascending: false })

      if (profissionaisError) throw profissionaisError
      setProfissionais(profissionaisData || [])

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  // Ações nos usuários
  const handleUserAction = async (action: string, userData: any) => {
    try {
      const user = await checkAdminPermissions()

      if (action === 'create') {
        const { error } = await supabase
          .from('users')
          .insert([{
            ...userData,
            created_by: user?.id
          }])
        if (error) throw error
      } else if (action === 'update') {
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', userData.id)
        if (error) throw error
      } else if (action === 'delete') {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userData.id)
        if (error) throw error
      }

      await fetchData()
      setShowUserForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  // Ações nos profissionais
  const handleProfissionalAction = async (action: string, profissionalData: any) => {
    try {
      const user = await checkAdminPermissions()

      if (action === 'create') {
        // Verifica se todos os campos obrigatórios estão preenchidos
        if (!profissionalData.nome || !profissionalData.email || !profissionalData.telefone || !profissionalData.especialidade) {
          throw new Error('Todos os campos são obrigatórios')
        }

        // Cria o profissional
        const { data, error } = await supabase
          .from('profissionais')
          .insert([{
            nome: profissionalData.nome,
            email: profissionalData.email,
            telefone: profissionalData.telefone,
            especialidade: profissionalData.especialidade,
            created_by: user?.id
          }])
          .select()

        if (error) throw error

        if (!data || data.length === 0) {
          throw new Error('Erro ao criar profissional')
        }

      } else if (action === 'update') {
        // Atualiza o profissional
        const { error } = await supabase
          .from('profissionais')
          .update({
            nome: profissionalData.nome,
            email: profissionalData.email,
            telefone: profissionalData.telefone,
            especialidade: profissionalData.especialidade
          })
          .eq('id', profissionalData.id)

        if (error) throw error

      } else if (action === 'delete') {
        // Remove o profissional
        const { error } = await supabase
          .from('profissionais')
          .delete()
          .eq('id', profissionalData.id)

        if (error) throw error
      }

      await fetchData()
      setShowProfissionalForm(false)
    } catch (err) {
      console.error('Erro ao salvar profissional:', err)
      setError(err.message)
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
              <h1 className="text-xl font-bold">Painel do Administrador</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setShowUserForm(true)
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Novo Usuário
              </button>
              <button
                onClick={() => {
                  setSelectedProfissional(null)
                  setShowProfissionalForm(true)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Novo Profissional
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

        {/* Stats Panel */}
        <StatsPanel consultas={consultas} users={users} />

        {/* Consultas Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Consultas</h2>
          </div>
          <ConsultaTable
            consultas={consultas}
            onAction={handleConsultaAction}
            loading={loading}
          />
        </div>

        {/* Users Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Usuários</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Carregando...
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2 capitalize">{user.user_type}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserForm(true)
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleUserAction('delete', user)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profissionais Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Profissionais</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Especialidade</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Telefone</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Carregando...
                    </td>
                  </tr>
                ) : (
                  profissionais.map(profissional => (
                    <tr key={profissional.id} className="border-b">
                      <td className="px-4 py-2">{profissional.nome}</td>
                      <td className="px-4 py-2">{profissional.especialidade}</td>
                      <td className="px-4 py-2">{profissional.email}</td>
                      <td className="px-4 py-2">{profissional.telefone}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProfissional(profissional)
                            setShowProfissionalForm(true)
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleProfissionalAction('delete', profissional)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Form Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">
                  {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button
                  onClick={() => setShowUserForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <UserForm
                  user={selectedUser}
                  onClose={() => setShowUserForm(false)}
                  onSubmit={(userData) => 
                    handleUserAction(selectedUser ? 'update' : 'create', userData)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Profissional Form Modal */}
        {showProfissionalForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">
                  {selectedProfissional ? 'Editar Profissional' : 'Novo Profissional'}
                </h2>
                <button
                  onClick={() => setShowProfissionalForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <ProfissionalForm
                  profissional={selectedProfissional}
                  onClose={() => setShowProfissionalForm(false)}
                  onSubmit={(profissionalData) => 
                    handleProfissionalAction(
                      selectedProfissional ? 'update' : 'create', 
                      profissionalData
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
