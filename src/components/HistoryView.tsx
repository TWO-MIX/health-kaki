import React, { useState } from 'react'
import { Trash2, Filter, Calendar, StickyNote } from 'lucide-react'
import { HealthMetric } from '../App'

interface HistoryViewProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
  onDeleteMetric: (id: string) => void
}

const HistoryView: React.FC<HistoryViewProps> = ({ metrics, metricConfigs, onDeleteMetric }) => {
  const [selectedType, setSelectedType] = useState<HealthMetric['type'] | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const filteredMetrics = metrics
    .filter(metric => selectedType === 'all' || metric.type === selectedType)
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.timestamp.getTime() - a.timestamp.getTime()
      } else {
        return a.timestamp.getTime() - b.timestamp.getTime()
      }
    })

  const getMetricConfig = (type: HealthMetric['type']) => {
    return metricConfigs.find(config => config.type === type)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Health History</h2>
        <p className="text-gray-600">Track your progress over time</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Filter by Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as HealthMetric['type'] | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Metrics</option>
              {metricConfigs.map((config) => (
                <option key={config.type} value={config.type}>
                  {config.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-4">
        {filteredMetrics.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No readings found</h3>
            <p className="text-gray-600">
              {selectedType === 'all' 
                ? "Start tracking your health by adding your first reading!"
                : `No ${getMetricConfig(selectedType as HealthMetric['type'])?.title} readings yet.`
              }
            </p>
          </div>
        ) : (
          filteredMetrics.map((metric) => {
            const config = getMetricConfig(metric.type)
            const Icon = config?.icon

            return (
              <div
                key={metric.id}
                className={`${config?.bgColor} ${config?.borderColor} border-2 rounded-2xl p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {Icon && (
                      <div className={`p-3 ${config.bgColor} rounded-xl`}>
                        <Icon className={`h-6 w-6 ${config.color}`} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {config?.title}
                        </h3>
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value} {config?.unit}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {metric.timestamp.toLocaleDateString('en-SG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} at {metric.timestamp.toLocaleTimeString('en-SG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {metric.notes && (
                        <div className="flex items-start space-x-2 mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                          <StickyNote className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{metric.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMetric(metric.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete reading"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      {filteredMetrics.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredMetrics.length}</div>
              <div className="text-sm text-gray-600">Total Readings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(filteredMetrics.map(m => m.timestamp.toDateString())).size}
              </div>
              <div className="text-sm text-gray-600">Days Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {selectedType === 'all' ? new Set(filteredMetrics.map(m => m.type)).size : 1}
              </div>
              <div className="text-sm text-gray-600">Metric Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredMetrics.filter(m => m.notes).length / filteredMetrics.length * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600">With Notes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryView
