import { useState } from 'react'
import { User } from '../types'

interface UserFormProps {
  user?: User | null
  onClose: () => void
  onSubmit: (userData: any) => void
}

export default function UserForm({ user, onClose, onSubmit }: UserFormProps) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState(user?.user_type || 'cliente')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || (!user && !password)) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (!user && password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    const userData = {
      name,
      email,
      password: user ? undefined : password, // Só envia a senha se for um novo usuário
      user_type: userType
    }

    onSubmit(userData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

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

      {!user && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            minLength={6}
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Tipo de Usuário</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="cliente">Cliente</option>
          <option value="funcionario">Funcionário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {user ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}
