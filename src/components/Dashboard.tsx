import React from 'react'
import { HealthMetric } from '../App'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
  getLatestMetric: (type: HealthMetric['type']) => HealthMetric | undefined
  metricOrder: string[]
  visibilitySettings: Record<string, boolean>
}

const Dashboard: React.FC<DashboardProps> = ({ 
  metrics, 
  metricConfigs, 
  getLatestMetric, 
  metricOrder,
  visibilitySettings 
}) => {
  const getMetricData = (type: HealthMetric['type']) => {
    return metrics
      .filter(metric => metric.type === type)
      .slice(0, 7)
      .reverse()
      .map((metric, index) => ({
        reading: index + 1,
        value: type === 'blood_pressure' 
          ? metric.systolic 
          : parseFloat(metric.value),
        timestamp: metric.timestamp.toLocaleDateString()
      }))
  }

  const getHealthStatus = (type: HealthMetric['type'], value: string | number) => {
    switch (type) {
      case 'heart_rate':
        const hr = typeof value === 'string' ? parseInt(value) : value
        if (hr < 60) return { status: 'Low', color: 'text-blue-600', message: 'Resting heart rate is quite low leh' }
        if (hr > 100) return { status: 'High', color: 'text-red-600', message: 'Heart pumping quite fast sia!' }
        return { status: 'Normal', color: 'text-green-600', message: 'Heart rate looking steady lah!' }
      
      case 'blood_pressure':
        const latest = getLatestMetric('blood_pressure')
        if (!latest) return { status: 'No Data', color: 'text-gray-500', message: 'No readings yet' }
        if (latest.systolic! > 140 || latest.diastolic! > 90) {
          return { status: 'High', color: 'text-red-600', message: 'BP a bit high, take care ah!' }
        }
        if (latest.systolic! < 90 || latest.diastolic! < 60) {
          return { status: 'Low', color: 'text-blue-600', message: 'BP quite low, drink more water' }
        }
        return { status: 'Normal', color: 'text-green-600', message: 'BP looking good lah!' }
      
      case 'spo2':
        const spo2 = typeof value === 'string' ? parseInt(value) : value
        if (spo2 < 95) return { status: 'Low', color: 'text-red-600', message: 'Oxygen level a bit low, see doctor' }
        return { status: 'Normal', color: 'text-green-600', message: 'Oxygen level shiok!' }
      
      case 'blood_sugar':
        const bs = typeof value === 'string' ? parseFloat(value) : value
        if (bs > 11.1) return { status: 'High', color: 'text-red-600', message: 'Sugar level high, watch your diet' }
        if (bs < 4.0) return { status: 'Low', color: 'text-blue-600', message: 'Sugar level low, eat something sweet' }
        return { status: 'Normal', color: 'text-green-600', message: 'Sugar level just nice!' }
      
      default:
        return { status: 'Unknown', color: 'text-gray-500', message: '' }
    }
  }

  // Filter and order visible metrics
  const visibleMetrics = metricOrder
    .map(type => metricConfigs.find(config => config.type === type))
    .filter(config => config && visibilitySettings[config.type])

  const hasVisibleMetrics = visibleMetrics.length > 0

  return (
    <div className="w-full space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Welcome Message */}
      <div className="text-center px-1 xs:px-2">
        <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">Welcome back!</h2>
        <p className="text-xs xs:text-sm sm:text-base text-gray-600">Here's your health overview for today</p>
      </div>

      {/* No Visible Metrics Message */}
      {!hasVisibleMetrics && (
        <div className="w-full text-center py-8 xs:py-12 sm:py-16">
          <div className="max-w-md mx-auto">
            <div className="text-4xl xs:text-5xl sm:text-6xl mb-4">👁️</div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2">No metrics visible</h3>
            <p className="text-sm xs:text-base text-gray-600 mb-4">
              All your health metrics are currently hidden. Use the customize button to show the metrics you want to track.
            </p>
            <p className="text-xs xs:text-sm text-gray-500">
              Don't worry - your data is still safe! Hidden metrics just won't appear on your dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      {hasVisibleMetrics && (
        <div className="w-full grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-6">
          {visibleMetrics.map((config) => {
            const latest = getLatestMetric(config.type)
            const Icon = config.icon
            const healthStatus = latest ? getHealthStatus(config.type, latest.value) : null

            return (
              <div
                key={config.type}
                className={`w-full ${config.bgColor} ${config.borderColor} border-2 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
                  <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${config.color} flex-shrink-0`} />
                  {healthStatus && (
                    <span className={`text-xs font-medium px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full flex-shrink-0 ${
                      healthStatus.status === 'Normal' ? 'bg-green-100 text-green-700' :
                      healthStatus.status === 'High' ? 'bg-red-100 text-red-700' :
                      healthStatus.status === 'Low' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {healthStatus.status}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 xs:mb-2">
                  {config.title}
                </h3>
                
                {latest ? (
                  <div className="space-y-1 xs:space-y-2">
                    <div className="text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 break-words leading-tight">
                      {latest.value} {config.unit}
                    </div>
                    {healthStatus && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {healthStatus.message}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      {latest.timestamp.toLocaleDateString()} at {latest.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-sm xs:text-base sm:text-lg mb-1 xs:mb-2">No data yet</div>
                    <div className="text-xs sm:text-sm">Add your first reading!</div>
                  </div>
                )}

                {/* Mini Chart */}
                {latest && getMetricData(config.type).length > 1 && (
                  <div className="mt-2 xs:mt-3 sm:mt-4 h-12 xs:h-14 sm:h-16 lg:h-20 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getMetricData(config.type)}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={config.color.replace('text-', '#')} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Activity */}
      {metrics.length > 0 && hasVisibleMetrics && (
        <div className="w-full bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6">
          <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-1 xs:space-y-2 sm:space-y-3">
            {metrics
              .filter(metric => visibilitySettings[metric.type]) // Only show activity for visible metrics
              .slice(0, 5)
              .map((metric) => {
                const config = metricConfigs.find(c => c.type === metric.type)
                const Icon = config?.icon
                
                return (
                  <div key={metric.id} className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 p-1.5 xs:p-2 sm:p-3 bg-gray-50 rounded-lg">
                    {Icon && <Icon className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 ${config.color} flex-shrink-0`} />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs xs:text-sm sm:text-base truncate">
                        {config?.title}: {metric.value} {config?.unit}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {metric.timestamp.toLocaleDateString()} at {metric.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
