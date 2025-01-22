import React from 'react'
import { Consulta } from '../types'

interface ConsultaTableProps {
  consultas: Consulta[]
  onAction: (action: string, consulta: Consulta) => void
  loading: boolean
}

export default function ConsultaTable({ consultas, onAction, loading }: ConsultaTableProps) {
  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    aprovada: 'bg-green-100 text-green-800',
    rejeitada: 'bg-red-100 text-red-800'
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Paciente</th>
            <th className="px-4 py-2 text-left">Data</th>
            <th className="px-4 py-2 text-left">Status</th>
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
            consultas.map(consulta => (
              <tr key={consulta.id} className="border-b">
                <td className="px-4 py-2">{consulta.paciente_nome}</td>
                <td className="px-4 py-2">
                  {new Date(consulta.data).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${statusColors[consulta.status]}`}>
                    {consulta.status}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  {consulta.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => onAction('approve', consulta)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => onAction('reject', consulta)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onAction('reschedule', consulta)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Remarcar
                  </button>
                  <button
                    onClick={() => onAction('delete', consulta)}
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
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
  )
}
