import React from 'react'
import { LucideIcon } from 'lucide-react'
import { HealthMetric } from '../App'

interface MetricCardProps {
  title: string
  icon: LucideIcon
  value?: string
  unit: string
  color: string
  bgColor: string
  borderColor: string
  lastUpdated?: Date
  trend?: 'up' | 'down' | 'stable'
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  icon: Icon,
  value,
  unit,
  color,
  bgColor,
  borderColor,
  lastUpdated,
  trend
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className={`${bgColor} ${borderColor} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} bg-white rounded-lg shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-red-100 text-red-600' :
            trend === 'down' ? 'bg-green-100 text-green-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      
      {value ? (
        <div className="space-y-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-500">
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No data recorded</p>
          <p className="text-xs text-gray-400 mt-1">Add your first measurement</p>
        </div>
      )}
    </div>
  )
}

export default MetricCard
