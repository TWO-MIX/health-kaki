import React, { useState } from 'react'
import { X } from 'lucide-react'
import { HealthMetric } from '../App'

interface SingleMetricModalProps {
  isOpen: boolean
  onClose: () => void
  onAddMetric: (metric: Omit<HealthMetric, 'id' | 'timestamp'>) => void
  metricType: HealthMetric['type']
  metricConfig: any
}

const SingleMetricModal: React.FC<SingleMetricModalProps> = ({
  isOpen,
  onClose,
  onAddMetric,
  metricType,
  metricConfig
}) => {
  const [value, setValue] = useState('')
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen || !metricConfig) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (metricType === 'blood_pressure') {
      if (!systolic || !diastolic) return
      onAddMetric({
        type: metricType,
        value: `${systolic}/${diastolic}`,
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        notes: notes || undefined
      })
    } else {
      if (!value) return
      onAddMetric({
        type: metricType,
        value,
        notes: notes || undefined
      })
    }

    // Reset form
    setValue('')
    setSystolic('')
    setDiastolic('')
    setNotes('')
    onClose()
  }

  const Icon = metricConfig.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm xs:max-w-md max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 xs:p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg xs:rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center space-x-2 xs:space-x-3">
            <div className={`p-2 xs:p-2.5 sm:p-3 ${metricConfig.bgColor} ${metricConfig.borderColor} border rounded-lg`}>
              <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 ${metricConfig.color}`} />
            </div>
            <div>
              <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                Add {metricConfig.title}
              </h2>
              <p className="text-xs xs:text-sm text-gray-500">
                Quick entry for {metricConfig.title.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 xs:p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 xs:p-4 sm:p-6">
          {/* Value Input */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            {metricType === 'blood_pressure' ? (
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
                  Blood Pressure Reading (mmHg)
                </label>
                <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Systolic (top)"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="w-full px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                      required
                      min="50"
                      max="250"
                    />
                    <div className="text-xs text-gray-500 mt-1">Systolic</div>
                  </div>
                  <span className="text-gray-500 font-bold text-lg xs:text-xl sm:text-2xl">/</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Diastolic (bottom)"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="w-full px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                      required
                      min="30"
                      max="150"
                    />
                    <div className="text-xs text-gray-500 mt-1">Diastolic</div>
                  </div>
                </div>
                <div className="mt-2 p-2 xs:p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs xs:text-sm text-blue-700">
                    <strong>Example:</strong> If your reading shows 120/80, enter 120 in the first box and 80 in the second box.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
                  {metricConfig.title} Reading ({metricConfig.unit})
                </label>
                <input
                  type="number"
                  step={metricType === 'blood_sugar' ? '0.1' : '1'}
                  placeholder={`Enter your ${metricConfig.title.toLowerCase()} reading`}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                  required
                  min={metricType === 'heart_rate' ? '30' : metricType === 'spo2' ? '70' : '0'}
                  max={metricType === 'heart_rate' ? '220' : metricType === 'spo2' ? '100' : '30'}
                />
                
                {/* Helpful hints */}
                <div className={`mt-2 p-2 xs:p-3 ${metricConfig.bgColor} rounded-lg border ${metricConfig.borderColor}`}>
                  <div className={`text-xs xs:text-sm ${metricConfig.color}`}>
                    {metricType === 'heart_rate' && (
                      <>
                        <strong>Tip:</strong> Measure when resting. Normal range is typically 60-100 bpm.
                      </>
                    )}
                    {metricType === 'spo2' && (
                      <>
                        <strong>Tip:</strong> Use a pulse oximeter. Normal range is 95-100%.
                      </>
                    )}
                    {metricType === 'blood_sugar' && (
                      <>
                        <strong>Tip:</strong> Note if taken before/after meals. Normal fasting: 4.0-7.0 mmol/L.
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Any additional notes about this reading..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs xs:text-sm sm:text-base"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-gradient-to-r ${metricConfig.color.includes('red') ? 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' :
              metricConfig.color.includes('blue') ? 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' :
              metricConfig.color.includes('green') ? 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' :
              'from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600'
            } text-white py-2 xs:py-2.5 sm:py-3 px-3 xs:px-4 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-xs xs:text-sm sm:text-base`}
          >
            Add {metricConfig.title} Reading
          </button>
        </form>
      </div>
    </div>
  )
}

export default SingleMetricModal
