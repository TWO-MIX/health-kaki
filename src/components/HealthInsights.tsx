import React from 'react'
import { HealthMetric } from '../App'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, BarChart3 } from 'lucide-react'

interface HealthInsightsProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ metrics, metricConfigs }) => {
  const getMetricInsights = (type: HealthMetric['type']) => {
    const typeMetrics = metrics
      .filter(metric => metric.type === type)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    if (typeMetrics.length === 0) return null

    const config = metricConfigs.find(c => c.type === type)
    const latest = typeMetrics[typeMetrics.length - 1]
    const previous = typeMetrics.length > 1 ? typeMetrics[typeMetrics.length - 2] : null

    // Calculate trend
    let trend = 'stable'
    let trendValue = 0
    if (previous) {
      const latestVal = type === 'blood_pressure' ? latest.systolic! : parseFloat(latest.value)
      const prevVal = type === 'blood_pressure' ? previous.systolic! : parseFloat(previous.value)
      trendValue = ((latestVal - prevVal) / prevVal) * 100
      
      if (Math.abs(trendValue) > 5) {
        trend = trendValue > 0 ? 'up' : 'down'
      }
    }

    // Calculate statistics
    const values = typeMetrics.map(m => 
      type === 'blood_pressure' ? m.systolic! : parseFloat(m.value)
    )
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Health status assessment
    const getHealthStatus = () => {
      switch (type) {
        case 'heart_rate':
          const hr = parseFloat(latest.value)
          if (hr < 60) return { status: 'concern', message: 'Aiya, your heart beating quite slow leh uncle/auntie. Maybe check with doctor to be safe, okay?' }
          if (hr > 100) return { status: 'warning', message: 'Wah, your heart beating quite fast sia! Take it easy first, don\'t stress yourself too much ah!' }
          return { status: 'good', message: 'Eh very good leh! Your heart beating nice and steady. Keep up whatever you\'re doing ah!' }
        
        case 'blood_pressure':
          if (latest.systolic! > 140 || latest.diastolic! > 90) {
            return { status: 'warning', message: 'Alamak uncle/auntie, your blood pressure a bit high leh. Please watch your salt intake, don\'t eat too much zi char okay?' }
          }
          if (latest.systolic! < 90 || latest.diastolic! < 60) {
            return { status: 'concern', message: 'Eh your blood pressure quite low sia. Remember to drink more water and rest well ah. Take care of yourself!' }
          }
          return { status: 'good', message: 'Wah shiok! Your blood pressure very good leh! Your heart must be very happy with you!' }
        
        case 'spo2':
          const spo2 = parseFloat(latest.value)
          if (spo2 < 95) return { status: 'warning', message: 'Aiya, your oxygen level a bit low leh! Please see doctor quickly, don\'t delay ah uncle/auntie!' }
          return { status: 'good', message: 'Excellent lah! Your oxygen level damn good! Your lungs working perfectly, keep it up!' }
        
        case 'blood_sugar':
          const bs = parseFloat(latest.value)
          if (bs > 11.1) return { status: 'warning', message: 'Wah uncle/auntie, your sugar level quite high leh! Please cut down on sweet things, take care of yourself ah!' }
          if (bs < 4.0) return { status: 'concern', message: 'Eh your sugar level low sia! Quickly eat something sweet, don\'t make yourself dizzy ah!' }
          return { status: 'good', message: 'Very good lah! Your sugar level just nice! Your body very balanced, keep up the good work!' }
        
        default:
          return { status: 'good', message: 'Looking good!' }
      }
    }

    const healthStatus = getHealthStatus()

    return {
      config,
      latest,
      trend,
      trendValue,
      average,
      min,
      max,
      count: typeMetrics.length,
      healthStatus,
      recentReadings: typeMetrics.slice(-7)
    }
  }

  const allInsights = metricConfigs
    .map(config => getMetricInsights(config.type))
    .filter(insight => insight !== null)

  if (allInsights.length === 0) {
    return (
      <div className="w-full space-y-4 xs:space-y-5 sm:space-y-6">
        <div className="text-center px-1 xs:px-2">
          <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">My Health Insights</h2>
          <p className="text-xs xs:text-sm sm:text-base text-gray-600">Get personalized insights from your health data</p>
        </div>
        
        <div className="text-center py-6 xs:py-8 sm:py-12 bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg">
          <div className="text-gray-400 mb-3 xs:mb-4">
            <BarChart3 className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto" />
          </div>
          <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">No insights yet lah!</h3>
          <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-3 xs:px-4">
            Start tracking your health metrics to get personalized insights and recommendations!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3 xs:space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center px-1 xs:px-2">
        <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">My Health Insights</h2>
        <p className="text-xs xs:text-sm sm:text-base text-gray-600">Personalized analysis of your health journey</p>
      </div>

      {/* Overall Health Summary */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-green-50 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 border border-blue-200">
        <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">Overall Health Summary</h3>
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {metrics.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Readings</div>
          </div>
          <div className="text-center">
            <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {new Set(metrics.map(m => m.timestamp.toDateString())).size}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Days Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
              {allInsights.filter(i => i.healthStatus.status === 'good').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Healthy Metrics</div>
          </div>
          <div className="text-center">
            <div className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
              {allInsights.filter(i => i.healthStatus.status !== 'good').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Need Attention</div>
          </div>
        </div>
      </div>

      {/* Individual Metric Insights */}
      <div className="w-full space-y-2 xs:space-y-3 sm:space-y-4">
        {allInsights.map((insight) => {
          const Icon = insight.config.icon
          const TrendIcon = insight.trend === 'up' ? TrendingUp : 
                           insight.trend === 'down' ? TrendingDown : 
                           CheckCircle

          return (
            <div
              key={insight.config.type}
              className={`w-full ${insight.config.bgColor} ${insight.config.borderColor} border-2 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
                <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
                  <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${insight.config.color}`} />
                  <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                    {insight.config.title}
                  </h3>
                </div>
                <div className={`flex items-center space-x-1 px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-xs sm:text-sm font-medium ${
                  insight.healthStatus.status === 'good' ? 'bg-green-100 text-green-700' :
                  insight.healthStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {insight.healthStatus.status === 'good' ? <CheckCircle className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" /> :
                   <AlertTriangle className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />}
                  <span className="capitalize">{insight.healthStatus.status}</span>
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-2 xs:mb-3 sm:mb-4">
                <div className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {insight.latest.value} {insight.config.unit}
                </div>
                <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed">
                  {insight.healthStatus.message}
                </p>
              </div>

              {/* Trend and Statistics */}
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3 sm:mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-0.5 xs:mb-1">
                    <TrendIcon className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 ${
                      insight.trend === 'up' ? 'text-red-500' :
                      insight.trend === 'down' ? 'text-green-500' :
                      'text-gray-500'
                    }`} />
                  </div>
                  <div className="text-xs xs:text-sm sm:text-base font-semibold text-gray-900">
                    {insight.trend === 'stable' ? 'Stable' : 
                     `${Math.abs(insight.trendValue).toFixed(1)}%`}
                  </div>
                  <div className="text-xs text-gray-600">Trend</div>
                </div>
                <div className="text-center">
                  <div className="text-xs xs:text-sm sm:text-base font-semibold text-gray-900">
                    {insight.average.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-xs xs:text-sm sm:text-base font-semibold text-gray-900">
                    {insight.min} - {insight.max}
                  </div>
                  <div className="text-xs text-gray-600">Range</div>
                </div>
                <div className="text-center">
                  <div className="text-xs xs:text-sm sm:text-base font-semibold text-gray-900">
                    {insight.count}
                  </div>
                  <div className="text-xs text-gray-600">Readings</div>
                </div>
              </div>

              {/* Recent Readings Timeline */}
              <div className="border-t border-gray-200 pt-2 xs:pt-3 sm:pt-4">
                <h4 className="text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2 sm:mb-3 flex items-center">
                  <Calendar className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Recent Readings
                </h4>
                <div className="space-y-0.5 xs:space-y-1 sm:space-y-2">
                  {insight.recentReadings.slice(-3).map((reading) => (
                    <div key={reading.id} className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-600">
                        {reading.timestamp.toLocaleDateString()}
                      </span>
                      <span className="font-medium text-gray-900">
                        {reading.value} {insight.config.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Health Tips */}
      <div className="w-full bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6">
        <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">Health Tips for You</h3>
        <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>Uncle/Auntie, please keep tracking consistently ah!</strong> Every reading you take helps us understand your body better. Like how we check the weather before going out, checking your health regularly helps you stay strong and healthy lah!
            </p>
          </div>
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>Remember to show your readings to doctor during checkup!</strong> Your doctor will be so proud to see you taking care of yourself. These numbers tell a story about your health - let your doctor read this story with you, okay?
            </p>
          </div>
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-purple-50 rounded-lg">
            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>Try to take readings same time every day lah!</strong> Just like how you have your morning kopi at the same time, taking your health readings at the same time helps us see the real pattern. Maybe after breakfast or before dinner - whatever suits you best!
            </p>
          </div>
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-yellow-50 rounded-lg">
            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>Don't worry if numbers not perfect everyday!</strong> Your body is like the weather - sometimes sunny, sometimes cloudy. What's important is you're paying attention and taking care of yourself. Every small step counts, uncle/auntie!
            </p>
          </div>
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-pink-50 rounded-lg">
            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-pink-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>Share this app with your family and friends!</strong> Health is better when we take care of each other. Maybe teach your children or grandchildren how to use this too - they can help remind you to check your health regularly. Together stronger lah!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthInsights
