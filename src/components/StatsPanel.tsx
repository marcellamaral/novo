import React from 'react'

interface StatsPanelProps {
  consultas: any[]
  users: any[]
}

export default function StatsPanel({ consultas, users }: StatsPanelProps) {
  const stats = [
    {
      title: 'Total de Consultas',
      value: consultas.length,
      icon: '📅',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Consultas Pendentes',
      value: consultas.filter(c => c.status === 'pendente').length,
      icon: '⏳',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Consultas Aprovadas',
      value: consultas.filter(c => c.status === 'aprovada').length,
      icon: '✅',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Funcionários',
      value: users.length,
      icon: '👤',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} p-6 rounded-lg shadow`}>
          <div className="flex items-center">
            <span className="text-2xl mr-4">{stat.icon}</span>
            <div>
              <p className="text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
