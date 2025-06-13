import React from 'react'
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Activity 
} from 'lucide-react'
import { HealthInsight } from '../utils/healthInsights'

interface HealthInsightCardProps {
  insight: HealthInsight
  onClose: () => void
}

const iconMap = {
  Heart,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Activity
}

export const HealthInsightCard: React.FC<HealthInsightCardProps> = ({ insight, onClose }) => {
  const IconComponent = iconMap[insight.iconName as keyof typeof iconMap]

  return (
    <div className={`rounded-lg border ${insight.borderColor} ${insight.bgColor} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${insight.textColor} bg-white/60`}>
          <IconComponent className="h-6 w-6" />
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <h3 className={`text-lg font-semibold ${insight.textColor} mb-2`}>
        {insight.title}
      </h3>
      <p className="text-gray-600 mb-4">
        {insight.message}
      </p>
      
      {insight.recommendations && insight.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
          <ul className="space-y-1">
            {insight.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                <span className="text-gray-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
