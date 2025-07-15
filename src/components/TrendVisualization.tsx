import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HealthMetric } from '../App'
import { TrendingUp, TrendingDown, Minus, Calendar, Activity } from 'lucide-react'

interface TrendVisualizationProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
  visibilitySettings: Record<string, boolean>
}

const TrendVisualization: React.FC<TrendVisualizationProps> = ({ 
  metrics, 
  metricConfigs, 
  visibilitySettings 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(7)

  const getTrendData = (type: HealthMetric['type'], days: number) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const filteredMetrics = metrics
      .filter(metric => metric.type === type && metric.timestamp >= cutoffDate)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-days) // Get last N readings within the period

    return filteredMetrics.map((metric, index) => {
      let value: number
      if (type === 'blood_pressure') {
        value = metric.systolic || 0
      } else {
        value = parseFloat(metric.value)
      }

      return {
        index: index + 1,
        value,
        displayValue: metric.value,
        date: metric.timestamp.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: metric.timestamp.toLocaleDateString(),
        time: metric.timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: metric.timestamp
      }
    })
  }

  const getTrendDirection = (data: any[]) => {
    if (data.length < 2) return 'stable'
    
    const first = data[0].value
    const last = data[data.length - 1].value
    const change = ((last - first) / first) * 100
    
    if (Math.abs(change) < 5) return 'stable'
    return change > 0 ? 'rising' : 'falling'
  }

  const getStrokeColor = (type: HealthMetric['type']) => {
    switch (type) {
      case 'heart_rate': return '#ef4444'
      case 'blood_pressure': return '#3b82f6'
      case 'spo2': return '#10b981'
      case 'blood_sugar': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.fullDate}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].stroke }}>
            {data.displayValue}
          </p>
          <p className="text-sm text-gray-600">{data.time}</p>
        </div>
      )
    }
    return null
  }

  // Filter visible metrics
  const visibleMetrics = metricConfigs.filter(config => visibilitySettings[config.type])

  if (visibleMetrics.length === 0) {
    return (
      <div className="w-full space-y-4 xs:space-y-5 sm:space-y-6">
        <div className="text-center px-1 xs:px-2">
          <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">Health Trends</h2>
          <p className="text-xs xs:text-sm sm:text-base text-gray-600">Track your health patterns over time</p>
        </div>
        
        <div className="text-center py-6 xs:py-8 sm:py-12 bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg">
          <div className="text-gray-400 mb-3 xs:mb-4">
            <Activity className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto" />
          </div>
          <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">No metrics visible</h3>
          <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-3 xs:px-4">
            Use the customize button to show the metrics you want to track trends for.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header with Period Selector */}
      <div className="text-center px-1 xs:px-2">
        <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">Health Trends</h2>
        <p className="text-xs xs:text-sm sm:text-base text-gray-600 mb-3 xs:mb-4">Perfect for tracking medication effects and showing your doctor</p>
        
        {/* Period Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setSelectedPeriod(7)}
              className={`px-2 xs:px-3 sm:px-4 lg:px-6 py-1.5 xs:py-2 rounded-md text-xs xs:text-sm sm:text-base font-medium transition-all ${
                selectedPeriod === 7
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-3 w-3 xs:h-4 xs:w-4 inline mr-1 xs:mr-2" />
              7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod(30)}
              className={`px-2 xs:px-3 sm:px-4 lg:px-6 py-1.5 xs:py-2 rounded-md text-xs xs:text-sm sm:text-base font-medium transition-all ${
                selectedPeriod === 30
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-3 w-3 xs:h-4 xs:w-4 inline mr-1 xs:mr-2" />
              30 Days
            </button>
            <button
              onClick={() => setSelectedPeriod(90)}
              className={`px-2 xs:px-3 sm:px-4 lg:px-6 py-1.5 xs:py-2 rounded-md text-xs xs:text-sm sm:text-base font-medium transition-all ${
                selectedPeriod === 90
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-3 w-3 xs:h-4 xs:w-4 inline mr-1 xs:mr-2" />
              90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Medical Context Info */}
      <div className={`w-full rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 border ${
        selectedPeriod === 90 
          ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-2 xs:space-x-3">
          <Activity className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 mt-0.5 flex-shrink-0 ${
            selectedPeriod === 90 ? 'text-purple-500' : 'text-blue-500'
          }`} />
          <div>
            <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 mb-1 xs:mb-2">
              {selectedPeriod}-Day Medical Trends
            </h3>
            <p className="text-xs xs:text-sm sm:text-base text-gray-700 leading-relaxed">
              <strong>Uncle/Auntie, these charts very useful for you and your doctor!</strong> 
              {selectedPeriod === 7 && (
                ' 7-day trends show recent changes - perfect for checking if new medication working or not. Show this to your doctor during next visit ah!'
              )}
              {selectedPeriod === 30 && (
                ' 30-day trends show longer patterns - excellent for seeing how your body responding to treatment over time. Your doctor will be very impressed with your detailed tracking!'
              )}
              {selectedPeriod === 90 && (
                ' 90-day trends show the BIG PICTURE - perfect for chronic conditions like diabetes and high blood pressure! This is what specialists love to see - shows seasonal patterns, medication effectiveness over time, and long-term health improvements. Very professional tracking lah!'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Trend Charts Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
        {visibleMetrics.map((config) => {
          const trendData = getTrendData(config.type, selectedPeriod)
          const Icon = config.icon
          const trendDirection = getTrendDirection(trendData)
          
          const TrendIcon = trendDirection === 'rising' ? TrendingUp :
                           trendDirection === 'falling' ? TrendingDown :
                           Minus

          const trendColor = trendDirection === 'rising' ? 'text-red-500' :
                            trendDirection === 'falling' ? 'text-green-500' :
                            'text-gray-500'

          const trendText = trendDirection === 'rising' ? 'Rising' :
                           trendDirection === 'falling' ? 'Falling' :
                           'Stable'

          return (
            <div
              key={config.type}
              className={`w-full ${config.bgColor} ${config.borderColor} border-2 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 transition-all hover:shadow-lg`}
            >
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <div className="flex items-center space-x-2 xs:space-x-3">
                  <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 ${config.color}`} />
                  <div>
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900">
                      {config.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      Last {selectedPeriod} days • {trendData.length} readings
                    </p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-2 xs:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${trendColor} bg-white bg-opacity-70`}>
                  <TrendIcon className="h-3 w-3 xs:h-4 xs:w-4" />
                  <span>{trendText}</span>
                </div>
              </div>

              {/* Chart */}
              {trendData.length === 0 ? (
                <div className="text-center py-8 xs:py-12">
                  <Icon className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 xs:mb-3" />
                  <p className="text-xs xs:text-sm text-gray-500">No data in last {selectedPeriod} days</p>
                  <p className="text-xs text-gray-400 mt-1">Add readings to see trends</p>
                </div>
              ) : trendData.length === 1 ? (
                <div className="text-center py-6 xs:py-8">
                  <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">
                    {trendData[0].displayValue}
                  </div>
                  <div className="text-xs xs:text-sm text-gray-500 mb-1">{config.unit}</div>
                  <div className="text-xs text-gray-400">
                    {trendData[0].fullDate}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 xs:mt-4">Need more readings for trend analysis</p>
                </div>
              ) : (
                <div className="h-32 xs:h-40 sm:h-48 lg:h-56 mb-3 xs:mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        interval={selectedPeriod === 90 ? 'preserveStartEnd' : selectedPeriod === 30 ? 'preserveStartEnd' : 0}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                        width={35}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={getStrokeColor(config.type)}
                        strokeWidth={2}
                        dot={{ fill: getStrokeColor(config.type), strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: getStrokeColor(config.type), strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Chart Summary */}
              {trendData.length > 1 && (
                <div className="border-t border-gray-200 pt-2 xs:pt-3">
                  <div className="grid grid-cols-2 gap-2 xs:gap-3 text-xs xs:text-sm">
                    <div>
                      <span className="text-gray-600">Latest: </span>
                      <span className="font-semibold text-gray-900">
                        {trendData[trendData.length - 1].displayValue} {config.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Average: </span>
                      <span className="font-semibold text-gray-900">
                        {(trendData.reduce((sum, d) => sum + d.value, 0) / trendData.length).toFixed(1)} {config.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Highest: </span>
                      <span className="font-semibold text-gray-900">
                        {Math.max(...trendData.map(d => d.value)).toFixed(1)} {config.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lowest: </span>
                      <span className="font-semibold text-gray-900">
                        {Math.min(...trendData.map(d => d.value)).toFixed(1)} {config.unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Medical Advice Section - Enhanced for 90-day */}
      <div className="w-full bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6">
        <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
          How to Use These Trends with Your Doctor
        </h3>
        <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>Show these charts during your medical appointments!</strong> Your doctor can see exactly how your body responding to treatment. Much better than trying to remember what your readings were like last week, right uncle/auntie?
            </p>
          </div>
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-green-50 rounded-lg">
            <Calendar className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>7-day trends perfect for new medications!</strong> When doctor give you new medicine, use 7-day view to see if it's working quickly. If numbers getting better, means the medicine suits you lah!
            </p>
          </div>
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-purple-50 rounded-lg">
            <Activity className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>30-day trends show the big picture!</strong> Use this for long-term medication adjustments. Your doctor can see if your overall health improving over the month. Very useful for chronic conditions like diabetes and high blood pressure!
            </p>
          </div>
          {selectedPeriod === 90 && (
            <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <Calendar className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                <strong>90-day trends are GOLD for specialists!</strong> This shows seasonal patterns, long-term medication effectiveness, and lifestyle impact on your health. Perfect for diabetes specialists, cardiologists, and family doctors. They can see if your condition is truly improving over 3 months - this is professional-level health tracking that doctors really appreciate!
              </p>
            </div>
          )}
          <div className="flex items-start space-x-1.5 xs:space-x-2 sm:space-x-3 p-1.5 xs:p-2 sm:p-3 bg-yellow-50 rounded-lg">
            <TrendingDown className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <strong>Don't panic if you see ups and downs!</strong> Your body naturally has good days and not-so-good days. What matters is the overall trend. If generally going in right direction, you're doing well uncle/auntie!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrendVisualization
