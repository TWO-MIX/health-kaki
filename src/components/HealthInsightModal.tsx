import React from 'react'
import { X, Heart, AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown } from 'lucide-react'
import { HealthMetric } from '../App'

interface HealthInsight {
  type: 'positive' | 'warning' | 'concern' | 'info'
  title: string
  message: string
  icon: React.ReactNode
  bgColor: string
  borderColor: string
  textColor: string
  recommendations?: string[]
}

interface HealthInsightModalProps {
  isOpen: boolean
  onClose: () => void
  insights: HealthInsight[]
  latestMetrics: HealthMetric[]
}

const HealthInsightModal: React.FC<HealthInsightModalProps> = ({
  isOpen,
  onClose,
  insights,
  latestMetrics
}) => {
  if (!isOpen || insights.length === 0) return null

  const formatMetricValue = (metric: HealthMetric) => {
    const configs = {
      heart_rate: { unit: 'bpm', label: 'Heart Rate' },
      blood_pressure: { unit: 'mmHg', label: 'Blood Pressure' },
      spo2: { unit: '%', label: 'SpO2' },
      blood_sugar: { unit: 'mmol/L', label: 'Blood Sugar' }
    }
    
    const config = configs[metric.type]
    return `${config.label}: ${metric.value} ${config.unit}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Health Insights</h2>
              <p className="text-sm text-gray-600">Personalized feedback on your latest readings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Latest Readings Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Latest Readings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {latestMetrics.map((metric) => (
                <div key={metric.id} className="bg-white rounded-lg p-3 text-sm">
                  <span className="font-medium text-gray-900">{formatMetricValue(metric)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`${insight.bgColor} ${insight.borderColor} border-2 rounded-xl p-6`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 ${insight.textColor} bg-white rounded-lg shadow-sm flex-shrink-0`}>
                    {insight.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{insight.message}</p>
                    
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthInsightModal
