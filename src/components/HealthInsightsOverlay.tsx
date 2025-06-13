import React from 'react'
import { HealthInsight } from '../utils/healthInsights'
import { HealthInsightCard } from './HealthInsightCard'

interface HealthInsightsOverlayProps {
  insights: HealthInsight[]
  isOpen: boolean
  onClose: () => void
}

export const HealthInsightsOverlay: React.FC<HealthInsightsOverlayProps> = ({
  insights,
  isOpen,
  onClose
}) => {
  if (!isOpen || insights.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Personal Health Insights</h2>
              <p className="text-gray-600 mt-1">
                Eh, based on your latest readings, here's what we think lah
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <HealthInsightCard
                key={index}
                insight={insight}
                onClose={() => {}}
              />
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              These insights auto-generated based on your latest measurements lah
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Okay Lah!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
