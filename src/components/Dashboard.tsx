import React from 'react'
import { HealthMetric } from '../App'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
  getLatestMetric: (type: HealthMetric['type']) => HealthMetric | undefined
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, metricConfigs, getLatestMetric }) => {
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

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
        <p className="text-gray-600">Here's your health overview for today</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricConfigs.map((config) => {
          const latest = getLatestMetric(config.type)
          const Icon = config.icon
          const healthStatus = latest ? getHealthStatus(config.type, latest.value) : null

          return (
            <div
              key={config.type}
              className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-6 transition-all hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${config.color}`} />
                {healthStatus && (
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    healthStatus.status === 'Normal' ? 'bg-green-100 text-green-700' :
                    healthStatus.status === 'High' ? 'bg-red-100 text-red-700' :
                    healthStatus.status === 'Low' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {healthStatus.status}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {config.title}
              </h3>
              
              {latest ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {latest.value} {config.unit}
                  </div>
                  {healthStatus && (
                    <p className="text-sm text-gray-600">
                      {healthStatus.message}
                    </p>
                  )}
                  <div className="text-xs text-gray-500">
                    {latest.timestamp.toLocaleDateString()} at {latest.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-lg mb-2">No data yet</div>
                  <div className="text-sm">Add your first reading!</div>
                </div>
              )}

              {/* Mini Chart */}
              {latest && getMetricData(config.type).length > 1 && (
                <div className="mt-4 h-20">
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

      {/* Recent Activity */}
      {metrics.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {metrics.slice(0, 5).map((metric) => {
              const config = metricConfigs.find(c => c.type === metric.type)
              const Icon = config?.icon
              
              return (
                <div key={metric.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  {Icon && <Icon className={`h-5 w-5 ${config.color}`} />}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {config?.title}: {metric.value} {config?.unit}
                    </div>
                    <div className="text-sm text-gray-500">
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
