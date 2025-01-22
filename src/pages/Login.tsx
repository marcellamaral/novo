import { useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { supabase } from '../lib/supabaseClient'

    export default function Login() {
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState('')
      const navigate = useNavigate()

      const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            // Traduzir mensagem de erro específica
            if (error.message === 'Invalid login credentials') {
              throw new Error('Credenciais de login inválidas')
            }
            throw error
          }

          // Verificar o tipo de usuário e redirecionar
          const { data: userData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', data.user?.id)
            .single()

          if (userData) {
            switch (userData.user_type) {
              case 'cliente':
                navigate('/cliente')
                break
              case 'funcionario':
                navigate('/funcionario')
                break
              case 'admin':
                navigate('/admin')
                break
              default:
                throw new Error('Tipo de usuário inválido')
            }
          }
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mb-4 disabled:bg-blue-300"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full text-blue-500 hover:text-blue-600"
              >
                Criar nova conta
              </button>
            </form>
          </div>
        </div>
      )
    }
