import { useState, useEffect } from 'react'
import { Consulta } from '../types'
import { supabase } from '../lib/supabaseClient'

interface ConsultaFormProps {
  consulta?: Consulta | null
  onClose: () => void
  onSubmit: (consultaData: any) => void
}

const ConsultaForm = ({ consulta, onClose, onSubmit }: ConsultaFormProps) => {
  const [pacienteNome, setPacienteNome] = useState(consulta?.paciente_nome || '')
  const [data, setData] = useState(consulta?.data || '')
  const [descricao, setDescricao] = useState(consulta?.descricao || '')
  const [especialidade, setEspecialidade] = useState(consulta?.especialidade || '')
  const [profissionalId, setProfissionalId] = useState(consulta?.profissional_id || '')
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfissionais, setLoadingProfissionais] = useState(false)

  // Busca os dados do usuário e as especialidades disponíveis
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setPacienteNome(user.user_metadata.name || user.email)
      }
    }

    const fetchEspecialidades = async () => {
      const { data, error } = await supabase
        .from('profissionais')
        .select('especialidades')
      
      if (data) {
        const uniqueEspecialidades = [...new Set(data.flatMap(p => p.especialidades))]
        setEspecialidades(uniqueEspecialidades)
      }
    }

    fetchUserData()
    fetchEspecialidades()
  }, [])

  // Busca os profissionais quando uma especialidade é selecionada
  useEffect(() => {
    if (especialidade) {
      const fetchProfissionais = async () => {
        setLoadingProfissionais(true)
        setError('')
        try {
          console.log('Buscando profissionais para especialidade:', especialidade)

          // Verifica se a especialidade é válida
          if (!especialidade || typeof especialidade !== 'string') {
            throw new Error('Especialidade inválida')
          }

          // Busca os profissionais com a especialidade selecionada
          const { data, error } = await supabase
            .from('profissionais')
            .select('*')
            .contains('especialidades', [especialidade])
          
          console.log('Resultado da busca:', { data, error })
          
          if (error) {
            throw error
          }

          if (!data || data.length === 0) {
            console.warn('Nenhum profissional encontrado para a especialidade:', especialidade)
            setProfissionais([])
            setError('Nenhum profissional disponível para esta especialidade')
          } else {
            console.log('Profissionais encontrados:', data)
            setProfissionais(data)
          }
        } catch (err) {
          console.error('Erro ao buscar profissionais:', err)
          setError('Erro ao carregar profissionais. Tente novamente mais tarde.')
        } finally {
          setLoadingProfissionais(false)
        }
      }
      fetchProfissionais()
    } else {
      setProfissionais([])
    }
  }, [especialidade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!pacienteNome || !data || !descricao || !especialidade || !profissionalId) {
      setError('Todos os campos são obrigatórios')
      return
    }

    const consultaData = {
      paciente_nome: pacienteNome,
      data,
      descricao,
      especialidade,
      profissional_id: profissionalId,
      status: consulta?.status || 'pendente'
    }

    onSubmit(consultaData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nome do Paciente</label>
        <input
          type="text"
          value={pacienteNome}
          readOnly
          className="w-full px-3 py-2 border rounded-md bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Especialidade</label>
        <select
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Selecione uma especialidade</option>
          {especialidades.map((esp, index) => (
            <option key={index} value={esp}>{esp}</option>
          ))}
        </select>
      </div>

      {especialidade && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Profissional</label>
          <select
            value={profissionalId}
            onChange={(e) => setProfissionalId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
            disabled={loadingProfissionais}
          >
            <option value="">Selecione um profissional</option>
            {loadingProfissionais ? (
              <option value="" disabled>Carregando profissionais...</option>
            ) : (
              profissionais.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.nome} ({prof.especialidades?.join(', ')})
                </option>
              ))
            )}
          </select>
          {error && especialidade && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Data e Hora</label>
        <input
          type="datetime-local"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
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
          {consulta ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}

export default ConsultaForm
