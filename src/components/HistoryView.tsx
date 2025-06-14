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
    <div className="w-full space-y-3 xs:space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center px-1 xs:px-2">
        <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">Your Health History</h2>
        <p className="text-xs xs:text-sm sm:text-base text-gray-600">Track your progress over time</p>
      </div>

      {/* Filters */}
      <div className="w-full bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
              <Filter className="h-3 w-3 xs:h-4 xs:w-4 inline mr-1" />
              Filter by Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as HealthMetric['type'] | 'all')}
              className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
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
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
              <Calendar className="h-3 w-3 xs:h-4 xs:w-4 inline mr-1" />
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <div className="w-full space-y-2 xs:space-y-3 sm:space-y-4">
        {filteredMetrics.length === 0 ? (
          <div className="text-center py-6 xs:py-8 sm:py-12 bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg">
            <div className="text-gray-400 mb-3 xs:mb-4">
              <Calendar className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto" />
            </div>
            <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">No readings found</h3>
            <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-3 xs:px-4">
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
                className={`w-full ${config?.bgColor} ${config?.borderColor} border-2 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between gap-2 xs:gap-3">
                  <div className="flex items-start space-x-2 xs:space-x-3 sm:space-x-4 flex-1 min-w-0">
                    {Icon && (
                      <div className={`p-1.5 xs:p-2 sm:p-3 ${config.bgColor} rounded-lg sm:rounded-xl flex-shrink-0`}>
                        <Icon className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${config.color}`} />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 sm:gap-3 mb-1 xs:mb-2">
                        <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                          {config?.title}
                        </h3>
                        <span className="text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 break-words">
                          {metric.value} {config?.unit}
                        </span>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-600 mb-1 xs:mb-2">
                        {metric.timestamp.toLocaleDateString('en-SG', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })} at {metric.timestamp.toLocaleTimeString('en-SG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {metric.notes && (
                        <div className="flex items-start space-x-1.5 xs:space-x-2 mt-1.5 xs:mt-2 sm:mt-3 p-1.5 xs:p-2 sm:p-3 bg-white bg-opacity-50 rounded-lg">
                          <StickyNote className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{metric.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMetric(metric.id)}
                    className="p-1 xs:p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Delete reading"
                  >
                    <Trash2 className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      {filteredMetrics.length > 0 && (
        <div className="w-full bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6">
          <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-2 xs:mb-3 sm:mb-4">Summary</h3>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{filteredMetrics.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Readings</div>
            </div>
            <div className="text-center">
              <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {new Set(filteredMetrics.map(m => m.timestamp.toDateString())).size}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Days Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                {selectedType === 'all' ? new Set(filteredMetrics.map(m => m.type)).size : 1}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Metric Types</div>
            </div>
            <div className="text-center">
              <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                {Math.round(filteredMetrics.filter(m => m.notes).length / filteredMetrics.length * 100) || 0}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">With Notes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryView
