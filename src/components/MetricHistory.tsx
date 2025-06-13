import React, { useState } from 'react'
import { Trash2, Calendar, Clock, StickyNote } from 'lucide-react'
import { HealthMetric } from '../App'

interface MetricHistoryProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
  onDeleteMetric: (id: string) => void
}

const MetricHistory: React.FC<MetricHistoryProps> = ({
  metrics,
  metricConfigs,
  onDeleteMetric
}) => {
  const [filterType, setFilterType] = useState<HealthMetric['type'] | 'all'>('all')

  const filteredMetrics = filterType === 'all' 
    ? metrics 
    : metrics.filter(m => m.type === filterType)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getMetricConfig = (type: HealthMetric['type']) => {
    return metricConfigs.find(config => config.type === type)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metric History</h2>
          <p className="text-gray-600">View and manage your health measurements</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Metrics</option>
            {metricConfigs.map(config => (
              <option key={config.type} value={config.type}>
                {config.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics List */}
      {filteredMetrics.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h3>
          <p className="text-gray-500">
            {filterType === 'all' 
              ? "Start tracking your health by adding your first metric"
              : `No ${getMetricConfig(filterType as HealthMetric['type'])?.title} measurements recorded`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMetrics.map((metric) => {
            const config = getMetricConfig(metric.type)
            const Icon = config?.icon
            
            return (
              <div
                key={metric.id}
                className={`${config?.bgColor} ${config?.borderColor} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 ${config?.color} bg-white rounded-lg shadow-sm`}>
                      {Icon && <Icon className="h-6 w-6" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {config?.title}
                        </h3>
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value}
                        </span>
                        <span className="text-sm text-gray-500">
                          {config?.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(metric.timestamp)}</span>
                        </div>
                      </div>
                      
                      {metric.notes && (
                        <div className="mt-3 flex items-start space-x-2">
                          <StickyNote className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{metric.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteMetric(metric.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete metric"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MetricHistory
