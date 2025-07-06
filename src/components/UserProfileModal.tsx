import React, { useState, useEffect } from 'react'
import { X, User, Scale, Ruler, Calendar } from 'lucide-react'

export interface UserProfile {
  age: number
  height: number // in cm
  weight: number // in kg
  gender: 'male' | 'female'
  name?: string
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profile: UserProfile) => void
  currentProfile?: UserProfile
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    age: currentProfile?.age || 30,
    height: currentProfile?.height || 170,
    weight: currentProfile?.weight || 70,
    gender: currentProfile?.gender || 'male',
    name: currentProfile?.name || ''
  })

  useEffect(() => {
    if (currentProfile) {
      setProfile(currentProfile)
    }
  }, [currentProfile])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(profile)
    onClose()
  }

  const calculateBMI = () => {
    const heightInM = profile.height / 100
    return (profile.weight / (heightInM * heightInM)).toFixed(1)
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    return { category: 'Obese', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const bmi = parseFloat(calculateBMI())
  const bmiInfo = getBMICategory(bmi)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm xs:max-w-md max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 xs:p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg xs:rounded-t-xl sm:rounded-t-2xl">
          <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={onClose}
            className="p-1 xs:p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 xs:p-4 sm:p-6">
          {/* Name */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
              Name (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Your name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-7 xs:pl-9 sm:pl-10 pr-2 xs:pr-3 sm:pr-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Age */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
              Age (years)
            </label>
            <div className="relative">
              <Calendar className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              <input
                type="number"
                min="1"
                max="120"
                placeholder="Age"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className="w-full pl-7 xs:pl-9 sm:pl-10 pr-2 xs:pr-3 sm:pr-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Gender */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, gender: 'male' }))}
                className={`p-2 xs:p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  profile.gender === 'male'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs sm:text-sm font-medium text-center">Male</div>
              </button>
              <button
                type="button"
                onClick={() => setProfile(prev => ({ ...prev, gender: 'female' }))}
                className={`p-2 xs:p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  profile.gender === 'female'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs sm:text-sm font-medium text-center">Female</div>
              </button>
            </div>
          </div>

          {/* Height */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
              Height (cm)
            </label>
            <div className="relative">
              <Ruler className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              <input
                type="number"
                min="100"
                max="250"
                placeholder="Height in cm"
                value={profile.height}
                onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                className="w-full pl-7 xs:pl-9 sm:pl-10 pr-2 xs:pr-3 sm:pr-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Weight */}
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1.5 xs:mb-2">
              Weight (kg)
            </label>
            <div className="relative">
              <Scale className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              <input
                type="number"
                min="20"
                max="300"
                step="0.1"
                placeholder="Weight in kg"
                value={profile.weight}
                onChange={(e) => setProfile(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-7 xs:pl-9 sm:pl-10 pr-2 xs:pr-3 sm:pr-4 py-1.5 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs xs:text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* BMI Display */}
          {profile.height > 0 && profile.weight > 0 && (
            <div className={`mb-3 xs:mb-4 sm:mb-6 p-2 xs:p-3 sm:p-4 rounded-lg ${bmiInfo.bgColor} border border-gray-200`}>
              <div className="text-center">
                <div className="text-xs xs:text-sm font-medium text-gray-700 mb-1">Your BMI</div>
                <div className={`text-lg xs:text-xl sm:text-2xl font-bold ${bmiInfo.color} mb-1`}>
                  {calculateBMI()}
                </div>
                <div className={`text-xs xs:text-sm font-medium ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 xs:py-2.5 sm:py-3 px-3 xs:px-4 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-xs xs:text-sm sm:text-base"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  )
}

export default UserProfileModal
