import React, { useState } from 'react'
import { X, Heart, Activity, Droplets, Gauge } from 'lucide-react'
import { HealthMetric } from '../App'

interface AddMetricModalProps {
  isOpen: boolean
  onClose: () => void
  onAddMetric: (metric: Omit<HealthMetric, 'id' | 'timestamp'>) => void
  metricConfigs: any[]
  metrics: HealthMetric[]
}

const AddMetricModal: React.FC<AddMetricModalProps> = ({
  isOpen,
  onClose,
  onAddMetric,
  metricConfigs,
  metrics
}) => {
  const [selectedType, setSelectedType] = useState<HealthMetric['type']>('heart_rate')
  const [value, setValue] = useState('')
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedType === 'blood_pressure') {
      if (!systolic || !diastolic) return
      onAddMetric({
        type: selectedType,
        value: `${systolic}/${diastolic}`,
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        notes: notes || undefined
      })
    } else {
      if (!value) return
      onAddMetric({
        type: selectedType,
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

  const selectedConfig = metricConfigs.find(config => config.type === selectedType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm xs:max-w-md max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 xs:p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg xs:rounded-t-xl sm:rounded-t-2xl">
          <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">Add New Reading</h2>
          <button
            onClick={onClose}
            className="p-1 xs:p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 xs:p-4 sm:p-6">
          {/* Metric Type Selection */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2 sm:mb-3">
              Select Metric Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3">
              {metricConfigs.map((config) => {
                const Icon = config.icon
                return (
                  <button
                    key={config.type}
                    type="button"
                    onClick={() => setSelectedType(config.type)}
                    className={`p-2 xs:p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                      selectedType === config.type
                        ? `${config.borderColor} ${config.bgColor}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 ${
                      selectedType === config.type ? config.color : 'text-gray-400'
                    }`} />
                    <div className="text-xs sm:text-sm font-medium text-gray-900 text-center leading-tight">
                      {config.title}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Value Input */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            {selectedType === 'blood_pressure' ? (
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
                  Blood Pressure (mmHg)
                </label>
                <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                      required
                    />
                  </div>
                  <span className="text-gray-500 font-medium text-xs xs:text-sm sm:text-base">/</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
                  {selectedConfig?.title} ({selectedConfig?.unit})
                </label>
                <input
                  type="number"
                  step={selectedType === 'blood_sugar' ? '0.1' : '1'}
                  placeholder={`Enter ${selectedConfig?.title.toLowerCase()}`}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                  required
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs xs:text-sm sm:text-base"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 xs:py-2.5 sm:py-3 px-3 xs:px-4 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-xs xs:text-sm sm:text-base"
          >
            Add Reading
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddMetricModal
