import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb, 
  X,
  Heart,
  Activity,
  Droplets,
  Info,
  AlertTriangle,
  Calendar
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { HealthMetric } from '../App'
import { generateHealthInsights, HealthInsight } from '../utils/healthInsights'

interface HealthInsightsProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
}

const iconMap = {
  Heart,
  Activity,
  Droplets,
  Info,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ metrics, metricConfigs }) => {
  const [selectedInsight, setSelectedInsight] = useState<HealthInsight | null>(null)
  const [trendDays, setTrendDays] = useState(14)
  const insights = generateHealthInsights(metrics)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'concern':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Lightbulb className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'concern':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getMetricTrendData = (metricType: HealthMetric['type']) => {
    const filteredMetrics = metrics
      .filter(m => m.type === metricType)
      .slice(-trendDays)
      .reverse()

    return filteredMetrics.map((metric, index) => {
      let value: number
      let displayValue: string

      if (metricType === 'blood_pressure') {
        value = metric.systolic || 0
        displayValue = metric.value
      } else {
        value = parseFloat(metric.value)
        displayValue = metric.value
      }

      return {
        index: index + 1,
        value,
        displayValue,
        date: metric.timestamp.toLocaleDateString('en-SG', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: metric.timestamp.toLocaleDateString('en-SG'),
        time: metric.timestamp.toLocaleTimeString('en-SG', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    })
  }

  const getMetricConfig = (metricType: HealthMetric['type']) => {
    return metricConfigs.find(config => config.type === metricType)
  }

  const getNormalRanges = (metricType: HealthMetric['type']) => {
    switch (metricType) {
      case 'heart_rate':
        return { min: 60, max: 100, color: '#ef4444' }
      case 'blood_pressure':
        return { min: 90, max: 140, color: '#3b82f6' }
      case 'spo2':
        return { min: 95, max: 100, color: '#10b981' }
      case 'blood_sugar':
        return { min: 4.0, max: 11.1, color: '#8b5cf6' }
      default:
        return { min: 0, max: 100, color: '#6b7280' }
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const metricType = payload[0].payload.metricType
      const config = getMetricConfig(metricType)
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{config?.title}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].stroke }}>
            {data.displayValue} {config?.unit}
          </p>
          <p className="text-sm text-gray-600">{data.fullDate}</p>
          <p className="text-xs text-gray-500">{data.time}</p>
        </div>
      )
    }
    return null
  }

  const renderTrendGraph = (metricType: HealthMetric['type']) => {
    const trendData = getMetricTrendData(metricType)
    const config = getMetricConfig(metricType)
    const ranges = getNormalRanges(metricType)

    if (trendData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No data for past {trendDays} days</p>
        </div>
      )
    }

    if (trendData.length === 1) {
      return (
        <div className="text-center py-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {trendData[0].displayValue}
          </div>
          <div className="text-sm text-gray-500 mb-1">{config?.unit}</div>
          <div className="text-xs text-gray-400">
            {trendData[0].fullDate}
          </div>
          <p className="text-xs text-gray-400 mt-3">Need more readings for trend analysis</p>
        </div>
      )
    }

    // Add metricType to each data point for tooltip
    const chartData = trendData.map(d => ({ ...d, metricType }))

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            
            {/* Normal range reference lines */}
            {metricType !== 'blood_pressure' && (
              <>
                <ReferenceLine 
                  y={ranges.min} 
                  stroke="#10b981" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.6}
                  label={{ value: "Normal Min", position: "insideTopRight", fontSize: 10 }}
                />
                <ReferenceLine 
                  y={ranges.max} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.6}
                  label={{ value: "Normal Max", position: "insideBottomRight", fontSize: 10 }}
                />
              </>
            )}
            
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={ranges.color}
              strokeWidth={3}
              dot={{ fill: ranges.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: ranges.color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Trend Summary */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div>
              <span className="font-medium">Latest: </span>
              {chartData[chartData.length - 1].displayValue} {config?.unit}
            </div>
            <div>
              <span className="font-medium">Range: </span>
              {Math.min(...chartData.map(d => d.value)).toFixed(metricType === 'blood_sugar' ? 1 : 0)} - {Math.max(...chartData.map(d => d.value)).toFixed(metricType === 'blood_sugar' ? 1 : 0)} {config?.unit}
            </div>
            <div>
              <span className="font-medium">Trend: </span>
              <span className={`${
                chartData[chartData.length - 1].value > chartData[0].value 
                  ? 'text-red-600' 
                  : chartData[chartData.length - 1].value < chartData[0].value
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}>
                {chartData[chartData.length - 1].value > chartData[0].value 
                  ? '↗ Rising' 
                  : chartData[chartData.length - 1].value < chartData[0].value
                  ? '↘ Falling'
                  : '→ Stable'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getMetricTypeFromInsight = (insight: HealthInsight): HealthMetric['type'] | null => {
    if (insight.title.toLowerCase().includes('heart rate') || insight.iconName === 'Heart') {
      return 'heart_rate'
    }
    if (insight.title.toLowerCase().includes('blood pressure') || insight.title.toLowerCase().includes('bp')) {
      return 'blood_pressure'
    }
    if (insight.title.toLowerCase().includes('oxygen') || insight.title.toLowerCase().includes('spo2')) {
      return 'spo2'
    }
    if (insight.title.toLowerCase().includes('blood sugar') || insight.title.toLowerCase().includes('sugar')) {
      return 'blood_sugar'
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Health Insights</h2>
        <p className="text-gray-600">Comprehensive analysis of your health patterns and trends</p>
        
        {/* Trend Period Selector */}
        <div className="flex justify-center items-center space-x-4 mt-4">
          <span className="text-sm text-gray-600">Show trends for:</span>
          <div className="flex space-x-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTrendDays(days)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  trendDays === days
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <div className="text-gray-400 mb-4">
            <Lightbulb className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Not enough data yet lah!</h3>
          <p className="text-gray-600">
            Add at least 3 readings for each metric to get detailed health insights and personalized recommendations!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {insights.map((insight, index) => {
            const IconComponent = iconMap[insight.iconName as keyof typeof iconMap] || Info
            const metricType = getMetricTypeFromInsight(insight)
            
            return (
              <div
                key={index}
                className={`${getSeverityColor(insight.type)} border-2 rounded-2xl p-6 transition-all hover:shadow-lg cursor-pointer`}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 ${insight.bgColor} rounded-xl`}>
                    <IconComponent className={`h-6 w-6 ${insight.textColor}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {insight.title}
                      </h3>
                      {getSeverityIcon(insight.severity)}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {insight.message}
                    </p>
                    
                    {/* Trend Graph for specific metrics */}
                    {metricType && (
                      <div className="mb-4 bg-white bg-opacity-70 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {trendDays}-Day Trend Pattern
                          </span>
                        </div>
                        {renderTrendGraph(metricType)}
                      </div>
                    )}
                    
                    {insight.details && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {insight.details.highest && (
                          <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{insight.details.highest}</div>
                            <div className="text-xs text-gray-600">Highest</div>
                          </div>
                        )}
                        {insight.details.lowest && (
                          <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{insight.details.lowest}</div>
                            <div className="text-xs text-gray-600">Lowest</div>
                          </div>
                        )}
                        {insight.details.average && (
                          <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{insight.details.average}</div>
                            <div className="text-xs text-gray-600">Average</div>
                          </div>
                        )}
                        {insight.details.totalReadings && (
                          <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-gray-900">{insight.details.totalReadings}</div>
                            <div className="text-xs text-gray-600">Readings</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div className="bg-white bg-opacity-70 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Key Recommendations:</p>
                        <ul className="space-y-1">
                          {insight.recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                        {insight.recommendations.length > 2 && (
                          <p className="text-xs text-gray-500 mt-2">
                            +{insight.recommendations.length - 2} more recommendations • Click for details
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500">
                      Based on your recent health patterns • Click for full analysis
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedInsight.title}
              </h2>
              <button
                onClick={() => setSelectedInsight(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className={`${getSeverityColor(selectedInsight.type)} border-2 rounded-xl p-4`}>
                <div className="flex items-center space-x-3 mb-3">
                  {getSeverityIcon(selectedInsight.severity)}
                  <h3 className="font-semibold text-gray-900">Analysis Summary</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{selectedInsight.message}</p>
              </div>

              {/* Detailed Trend Graph in Modal */}
              {(() => {
                const metricType = getMetricTypeFromInsight(selectedInsight)
                return metricType && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        Detailed {trendDays}-Day Trend Analysis
                      </h3>
                      <div className="flex space-x-2">
                        {[7, 14, 30].map((days) => (
                          <button
                            key={days}
                            onClick={() => setTrendDays(days)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              trendDays === days
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {days}d
                          </button>
                        ))}
                      </div>
                    </div>
                    {renderTrendGraph(metricType)}
                  </div>
                )
              })()}

              {selectedInsight.details && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Detailed Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedInsight.details.highest && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedInsight.details.highest}</div>
                        <div className="text-sm text-gray-600">Highest Reading</div>
                      </div>
                    )}
                    {selectedInsight.details.lowest && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedInsight.details.lowest}</div>
                        <div className="text-sm text-gray-600">Lowest Reading</div>
                      </div>
                    )}
                    {selectedInsight.details.average && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedInsight.details.average}</div>
                        <div className="text-sm text-gray-600">Average</div>
                      </div>
                    )}
                    {selectedInsight.details.totalReadings && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedInsight.details.totalReadings}</div>
                        <div className="text-sm text-gray-600">Total Readings</div>
                      </div>
                    )}
                  </div>
                  {selectedInsight.details.concerningReadings !== undefined && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-700">
                          {selectedInsight.details.concerningReadings} out of {selectedInsight.details.totalReadings}
                        </div>
                        <div className="text-sm text-yellow-600">readings outside normal range</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedInsight.recommendations && selectedInsight.recommendations.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="h-5 w-5 text-blue-500 mr-2" />
                    Personalized Recommendations
                  </h3>
                  <div className="space-y-3">
                    {selectedInsight.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-white bg-opacity-70 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Disclaimer:</strong> These insights are based on your recorded data and are for informational purposes only. 
                  Always consult with healthcare professionals for medical advice and treatment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthInsights
