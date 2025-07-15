import React, { useState } from 'react'
import { X, Shield, Trash2, AlertTriangle, Check } from 'lucide-react'

interface DataPrivacyModalProps {
  isOpen: boolean
  onClose: () => void
  onResetData: () => void
}

const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({
  isOpen,
  onClose,
  onResetData
}) => {
  const [confirmationStep, setConfirmationStep] = useState(0)
  const [confirmationText, setConfirmationText] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  if (!isOpen) return null

  const handleReset = async () => {
    if (confirmationText.toLowerCase() !== 'delete all data') {
      return
    }

    setIsResetting(true)
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    onResetData()
    setIsResetting(false)
    setConfirmationStep(0)
    setConfirmationText('')
    onClose()
  }

  const resetSteps = [
    {
      title: 'Data Privacy & Reset',
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Your Privacy Matters</h4>
              <p className="text-sm text-blue-700">All your health data is stored locally on your device only. We never send your personal health information to any servers.</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">What gets stored locally:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Your health readings (heart rate, blood pressure, etc.)</li>
              <li>• Your profile information (age, height, weight)</li>
              <li>• Dashboard customization preferences</li>
              <li>• Metric visibility settings</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Reset All Data</h4>
                <p className="text-sm text-yellow-700">This will permanently delete all your health data, profile, and preferences. This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Confirm Data Reset',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">⚠️ Final Warning</h4>
                <p className="text-sm text-red-700 mb-3">This will permanently delete:</p>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>• All your health readings and history</li>
                  <li>• Your personal profile information</li>
                  <li>• Dashboard customization settings</li>
                  <li>• All preferences and configurations</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "DELETE ALL DATA" to confirm:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE ALL DATA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              autoComplete="off"
            />
          </div>

          <div className="text-xs text-gray-500">
            This action is irreversible. Make sure you really want to delete all your health data.
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm xs:max-w-md max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 xs:p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg xs:rounded-t-xl sm:rounded-t-2xl">
          <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">
            {resetSteps[confirmationStep].title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 xs:p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 xs:p-4 sm:p-6">
          {resetSteps[confirmationStep].content}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            {confirmationStep === 0 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setConfirmationStep(1)}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Reset All Data</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setConfirmationStep(0)
                    setConfirmationText('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  disabled={isResetting}
                >
                  Back
                </button>
                <button
                  onClick={handleReset}
                  disabled={confirmationText.toLowerCase() !== 'delete all data' || isResetting}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataPrivacyModal
