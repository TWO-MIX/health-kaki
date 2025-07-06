import React from 'react'
import { HealthMetric } from '../App'
import { UserProfile } from './UserProfileModal'
import { analyzeDemographicHealth } from '../utils/demographicHealthAnalysis'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardProps {
  metrics: HealthMetric[]
  metricConfigs: any[]
  getLatestMetric: (type: HealthMetric['type']) => HealthMetric | undefined
  metricOrder: string[]
  visibilitySettings: Record<string, boolean>
  userProfile?: UserProfile
  onMetricCardClick: (metricType: HealthMetric['type']) => void
}

const Dashboard: React.FC<DashboardProps> = ({ 
  metrics, 
  metricConfigs, 
  getLatestMetric, 
  metricOrder,
  visibilitySettings,
  userProfile,
  onMetricCardClick
}) => {
  const getMetricData = (type: HealthMetric['type']) => {
    return metrics
      .filter(metric => metric.type === type)
      .slice(0, 7)
      .reverse()
      .map((metric, index) => ({
        reading: index + 1,
        value: type === 'blood_pressure' 
          ? metric.systolic 
          : parseFloat(metric.value),
        timestamp: metric.timestamp.toLocaleDateString()
      }))
  }

  const getHealthStatus = (type: HealthMetric['type'], value: string | number) => {
    const latest = getLatestMetric(type)
    if (!latest) return { status: 'No Data', color: 'text-gray-500', message: 'No readings yet' }

    // Use demographic analysis if profile is available
    if (userProfile) {
      try {
        const analysis = analyzeDemographicHealth(latest, userProfile)
        const statusColorMap = {
          'excellent': { status: 'Excellent', color: 'text-green-600' },
          'good': { status: 'Good', color: 'text-green-600' },
          'borderline': { status: 'Borderline', color: 'text-yellow-600' },
          'concerning': { status: 'High Risk', color: 'text-red-600' },
          'critical': { status: 'Critical', color: 'text-red-700' }
        }
        
        const statusInfo = statusColorMap[analysis.analysis.status]
        return {
          status: statusInfo.status,
          color: statusInfo.color,
          message: analysis.analysis.personalizedMessage
        }
      } catch (error) {
        console.error('Error analyzing demographic health:', error)
        // Fall back to basic analysis
      }
    }

    // Fallback to basic analysis
    switch (type) {
      case 'heart_rate':
        const hr = typeof value === 'string' ? parseInt(value) : value
        if (hr < 60) return { status: 'Low', color: 'text-blue-600', message: 'Resting heart rate is quite low leh' }
        if (hr > 100) return { status: 'High', color: 'text-red-600', message: 'Heart pumping quite fast sia!' }
        return { status: 'Normal', color: 'text-green-600', message: 'Heart rate looking steady lah!' }
      
      case 'blood_pressure':
        if (latest.systolic! > 140 || latest.diastolic! > 90) {
          return { status: 'High', color: 'text-red-600', message: 'BP a bit high, take care ah!' }
        }
        if (latest.systolic! < 90 || latest.diastolic! < 60) {
          return { status: 'Low', color: 'text-blue-600', message: 'BP quite low, drink more water' }
        }
        return { status: 'Normal', color: 'text-green-600', message: 'BP looking good lah!' }
      
      case 'spo2':
        const spo2 = typeof value === 'string' ? parseInt(value) : value
        if (spo2 < 95) return { status: 'Low', color: 'text-red-600', message: 'Oxygen level a bit low, see doctor' }
        return { status: 'Normal', color: 'text-green-600', message: 'Oxygen level shiok!' }
      
      case 'blood_sugar':
        const bs = typeof value === 'string' ? parseFloat(value) : value
        if (bs > 11.1) return { status: 'High', color: 'text-red-600', message: 'Sugar level high, watch your diet' }
        if (bs < 4.0) return { status: 'Low', color: 'text-blue-600', message: 'Sugar level low, eat something sweet' }
        return { status: 'Normal', color: 'text-green-600', message: 'Sugar level just nice!' }
      
      default:
        return { status: 'Unknown', color: 'text-gray-500', message: '' }
    }
  }

  // Filter and order visible metrics
  const visibleMetrics = metricOrder
    .map(type => metricConfigs.find(config => config.type === type))
    .filter(config => config && visibilitySettings[config.type])

  const hasVisibleMetrics = visibleMetrics.length > 0

  return (
    <div className="w-full space-y-4 xs:space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Welcome Message */}
      <div className="text-center px-1 xs:px-2">
        <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">
          Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}!
        </h2>
        <p className="text-xs xs:text-sm sm:text-base text-gray-600">
          {userProfile 
            ? `Here's your personalized health overview (Age: ${userProfile.age}, BMI: ${(userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)})`
            : "Here's your health overview for today"
          }
        </p>
      </div>

      {/* Profile Reminder */}
      {!userProfile && (
        <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6">
          <div className="text-center">
            <h3 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 mb-1 xs:mb-2">Get Personalized Health Analysis!</h3>
            <p className="text-xs xs:text-sm text-gray-600 mb-2 xs:mb-3">
              Add your age, height, and weight to get personalized health insights based on your demographics.
            </p>
            <p className="text-xs text-blue-600 font-medium">
              Click "My Profile" to unlock age-appropriate health analysis!
            </p>
          </div>
        </div>
      )}

      {/* No Visible Metrics Message */}
      {!hasVisibleMetrics && (
        <div className="w-full text-center py-8 xs:py-12 sm:py-16">
          <div className="max-w-md mx-auto">
            <div className="text-4xl xs:text-5xl sm:text-6xl mb-4">👁️</div>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2">No metrics visible</h3>
            <p className="text-sm xs:text-base text-gray-600 mb-4">
              All your health metrics are currently hidden. Use the customize button to show the metrics you want to track.
            </p>
            <p className="text-xs xs:text-sm text-gray-500">
              Don't worry - your data is still safe! Hidden metrics just won't appear on your dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      {hasVisibleMetrics && (
        <div className="w-full grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-6">
          {visibleMetrics.map((config) => {
            const latest = getLatestMetric(config.type)
            const Icon = config.icon
            const healthStatus = latest ? getHealthStatus(config.type, latest.value) : null

            // Get demographic analysis if available
            let demographicAnalysis = null
            if (latest && userProfile) {
              try {
                demographicAnalysis = analyzeDemographicHealth(latest, userProfile)
              } catch (error) {
                console.error('Error getting demographic analysis:', error)
              }
            }

            return (
              <div
                key={config.type}
                onClick={() => onMetricCardClick(config.type)}
                className={`w-full ${config.bgColor} ${config.borderColor} border-2 rounded-lg xs:rounded-xl sm:rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group ${
                  !latest ? 'hover:border-opacity-70' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
                  <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${config.color} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                  {healthStatus && (
                    <span className={`text-xs font-medium px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full flex-shrink-0 ${
                      healthStatus.status === 'Normal' || healthStatus.status === 'Good' || healthStatus.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                      healthStatus.status === 'High' || healthStatus.status === 'High Risk' ? 'bg-red-100 text-red-700' :
                      healthStatus.status === 'Low' ? 'bg-blue-100 text-blue-700' :
                      healthStatus.status === 'Borderline' ? 'bg-yellow-100 text-yellow-700' :
                      healthStatus.status === 'Critical' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {healthStatus.status}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 xs:mb-2">
                  {config.title}
                </h3>
                
                {latest ? (
                  <div className="space-y-1 xs:space-y-2">
                    <div className="text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 break-words leading-tight">
                      {latest.value} {config.unit}
                    </div>
                    {healthStatus && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {healthStatus.message}
                      </p>
                    )}
                    
                    {/* Show demographic analysis if available */}
                    {demographicAnalysis && (
                      <div className="mt-1 xs:mt-2 p-1.5 xs:p-2 bg-white bg-opacity-50 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-700 mb-1">
                          <strong>Age-appropriate range:</strong> {demographicAnalysis.analysis.normalRange}
                        </div>
                        {demographicAnalysis.analysis.bmiImpact !== 'neutral' && (
                          <div className={`text-xs ${
                            demographicAnalysis.analysis.bmiImpact === 'positive' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            BMI impact: {demographicAnalysis.analysis.bmiImpact === 'positive' ? 'Helping' : 'Affecting'} your results
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {latest.timestamp.toLocaleDateString()} at {latest.timestamp.toLocaleTimeString()}
                    </div>
                    
                    {/* Click hint for existing data */}
                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to add new reading
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-sm xs:text-base sm:text-lg mb-1 xs:mb-2">No data yet</div>
                    <div className="text-xs sm:text-sm mb-2 xs:mb-3">Add your first reading!</div>
                    
                    {/* Click hint for no data */}
                    <div className="flex items-center justify-center p-2 xs:p-3 bg-white bg-opacity-50 rounded-lg border-2 border-dashed border-gray-300 group-hover:border-gray-400 transition-colors">
                      <div className="text-xs xs:text-sm text-gray-500 group-hover:text-gray-700 font-medium transition-colors">
                        👆 Click to add reading
                      </div>
                    </div>
                  </div>
                )}

                {/* Mini Chart */}
                {latest && getMetricData(config.type).length > 1 && (
                  <div className="mt-2 xs:mt-3 sm:mt-4 h-12 xs:h-14 sm:h-16 lg:h-20 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getMetricData(config.type)}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={config.color.replace('text-', '#')} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Activity */}
      {metrics.length > 0 && hasVisibleMetrics && (
        <div className="w-full bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6">
          <h3 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-1 xs:space-y-2 sm:space-y-3">
            {metrics
              .filter(metric => visibilitySettings[metric.type]) // Only show activity for visible metrics
              .slice(0, 5)
              .map((metric) => {
                const config = metricConfigs.find(c => c.type === metric.type)
                const Icon = config?.icon
                
                return (
                  <div key={metric.id} className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 p-1.5 xs:p-2 sm:p-3 bg-gray-50 rounded-lg">
                    {Icon && <Icon className={`h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 ${config.color} flex-shrink-0`} />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-xs xs:text-sm sm:text-base truncate">
                        {config?.title}: {metric.value} {config?.unit}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {metric.timestamp.toLocaleDateString()} at {metric.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
