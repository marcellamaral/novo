import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface ProfissionalFormProps {
  profissional?: any
  onClose: () => void
  onSubmit: (profissionalData: any) => void
}

const ProfissionalForm = ({ profissional, onClose, onSubmit }: ProfissionalFormProps) => {
  const [nome, setNome] = useState(profissional?.nome || '')
  const [especialidade, setEspecialidade] = useState(profissional?.especialidade || '')
  const [email, setEmail] = useState(profissional?.email || '')
  const [telefone, setTelefone] = useState(profissional?.telefone || '')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome || !email || !telefone || !especialidade) {
      setError('Todos os campos são obrigatórios')
      return
    }

    try {
      // Cria ou atualiza a especialidade
      const { data: especialidadeData, error: especialidadeError } = await supabase
        .from('especialidades')
        .upsert(
          { nome: especialidade.trim() },
          { onConflict: 'nome' }
        )
        .select()
        .single()

      if (especialidadeError) throw especialidadeError

      // Cria ou atualiza o profissional
      const profissionalData = {
        nome,
        email,
        telefone
      }

      if (profissional?.id) {
        profissionalData.id = profissional.id
      }

      const { data: profissionalResult, error: profissionalError } = await supabase
        .from('profissionais')
        .upsert(profissionalData)
        .select()
        .single()

      if (profissionalError) throw profissionalError

      // Cria o relacionamento entre profissional e especialidade
      const { error: relError } = await supabase
        .from('profissionais_especialidades')
        .upsert({
          profissional_id: profissionalResult.id,
          especialidade_id: especialidadeData.id
        })

      if (relError) throw relError

      onSubmit(profissionalResult)
    } catch (err) {
      console.error('Erro ao salvar profissional:', err)
      setError('Erro ao salvar profissional. Tente novamente mais tarde.')
    }
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
          value={nome}
          onChange={(e) => setNome(e.target.value)}
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

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Telefone</label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Especialidade</label>
        <input
          type="text"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
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
          {profissional ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}

export default ProfissionalForm
