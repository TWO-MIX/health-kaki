import React, { useState, useEffect } from 'react'
import { Heart, Activity, Droplets, Gauge, Plus, BarChart3, Clock, Lightbulb, Menu, X, Settings, TrendingUp } from 'lucide-react'
import AddMetricModal from './components/AddMetricModal'
import Dashboard from './components/Dashboard'
import HistoryView from './components/HistoryView'
import HealthInsights from './components/HealthInsights'
import TrendVisualization from './components/TrendVisualization'
import CustomizationModal from './components/CustomizationModal'

export interface HealthMetric {
  id: string
  type: 'heart_rate' | 'blood_pressure' | 'spo2' | 'blood_sugar'
  value: string
  systolic?: number
  diastolic?: number
  timestamp: Date
  notes?: string
}

type ViewType = 'dashboard' | 'history' | 'insights' | 'trends'

const App: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [metricOrder, setMetricOrder] = useState<string[]>([])
  const [visibilitySettings, setVisibilitySettings] = useState<Record<string, boolean>>({})

  const metricConfigs = [
    {
      type: 'heart_rate',
      title: 'Heart Rate',
      icon: Heart,
      unit: 'bpm',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      type: 'blood_pressure',
      title: 'Blood Pressure',
      icon: Activity,
      unit: 'mmHg',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      type: 'spo2',
      title: 'SpO2',
      icon: Droplets,
      unit: '%',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      type: 'blood_sugar',
      title: 'Blood Sugar',
      icon: Gauge,
      unit: 'mmol/L',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  // Initialize default settings
  useEffect(() => {
    const defaultOrder = metricConfigs.map(config => config.type)
    const defaultVisibility = metricConfigs.reduce((acc, config) => {
      acc[config.type] = true
      return acc
    }, {} as Record<string, boolean>)

    // Load saved settings or use defaults
    const savedOrder = localStorage.getItem('metricOrder')
    const savedVisibility = localStorage.getItem('visibilitySettings')

    setMetricOrder(savedOrder ? JSON.parse(savedOrder) : defaultOrder)
    setVisibilitySettings(savedVisibility ? JSON.parse(savedVisibility) : defaultVisibility)
  }, [])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMetrics = localStorage.getItem('healthMetrics')
    if (savedMetrics) {
      const parsedMetrics = JSON.parse(savedMetrics).map((metric: any) => ({
        ...metric,
        timestamp: new Date(metric.timestamp)
      }))
      setMetrics(parsedMetrics)
    }
  }, [])

  // Save to localStorage whenever metrics change
  useEffect(() => {
    localStorage.setItem('healthMetrics', JSON.stringify(metrics))
  }, [metrics])

  // Save customization settings
  useEffect(() => {
    if (metricOrder.length > 0) {
      localStorage.setItem('metricOrder', JSON.stringify(metricOrder))
    }
  }, [metricOrder])

  useEffect(() => {
    if (Object.keys(visibilitySettings).length > 0) {
      localStorage.setItem('visibilitySettings', JSON.stringify(visibilitySettings))
    }
  }, [visibilitySettings])

  const addMetric = (newMetric: Omit<HealthMetric, 'id' | 'timestamp'>) => {
    const metric: HealthMetric = {
      ...newMetric,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMetrics(prev => [metric, ...prev])
  }

  const deleteMetric = (id: string) => {
    setMetrics(prev => prev.filter(metric => metric.id !== id))
  }

  const getLatestMetric = (type: HealthMetric['type']) => {
    return metrics.find(metric => metric.type === type)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    closeMobileMenu()
  }

  const handleOrderChange = (newOrder: string[]) => {
    setMetricOrder(newOrder)
  }

  const handleVisibilityChange = (newVisibility: Record<string, boolean>) => {
    setVisibilitySettings(newVisibility)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            metrics={metrics}
            metricConfigs={metricConfigs}
            getLatestMetric={getLatestMetric}
            metricOrder={metricOrder}
            visibilitySettings={visibilitySettings}
          />
        )
      case 'history':
        return (
          <HistoryView
            metrics={metrics}
            metricConfigs={metricConfigs}
            onDeleteMetric={deleteMetric}
          />
        )
      case 'insights':
        return (
          <HealthInsights
            metrics={metrics}
            metricConfigs={metricConfigs}
          />
        )
      case 'trends':
        return (
          <TrendVisualization
            metrics={metrics}
            metricConfigs={metricConfigs}
            visibilitySettings={visibilitySettings}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Desktop Layout - Horizontal */}
          <div className="hidden lg:flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex-shrink-0">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">Health Kaki</h1>
                <p className="text-sm text-gray-500">Your personal health companion</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('trends')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  currentView === 'trends'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Trends
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  currentView === 'history'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-1" />
                History
              </button>
              <button
                onClick={() => setCurrentView('insights')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  currentView === 'insights'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Lightbulb className="h-4 w-4 inline mr-1" />
                My Insights
              </button>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setIsCustomizationOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Customize</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Metrics</span>
              </button>
            </div>
          </div>

          {/* Mobile/Tablet Layout - Vertical Stack */}
          <div className="lg:hidden">
            {/* Logo Section */}
            <div className="flex items-center justify-between py-2 xs:py-3 sm:py-4">
              <div className="flex items-center space-x-2 xs:space-x-3 min-w-0 flex-1">
                <div className="p-1.5 xs:p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-md xs:rounded-lg flex-shrink-0">
                  <Heart className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 truncate">Health Kaki</h1>
                  <p className="text-xs text-gray-500 hidden xs:block">Your personal health companion</p>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 xs:p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 xs:h-5 xs:w-5" />
                ) : (
                  <Menu className="h-4 w-4 xs:h-5 xs:w-5" />
                )}
              </button>
            </div>

            {/* Navigation Buttons - Horizontal Auto Layout */}
            <div className="pb-2 xs:pb-3 sm:pb-4">
              <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center space-x-1 xs:space-x-1.5 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-colors text-xs xs:text-sm whitespace-nowrap flex-shrink-0 ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <BarChart3 className="h-3 w-3 xs:h-4 xs:w-4" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('trends')}
                  className={`flex items-center space-x-1 xs:space-x-1.5 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-colors text-xs xs:text-sm whitespace-nowrap flex-shrink-0 ${
                    currentView === 'trends'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4" />
                  <span>Trends</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('history')}
                  className={`flex items-center space-x-1 xs:space-x-1.5 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-colors text-xs xs:text-sm whitespace-nowrap flex-shrink-0 ${
                    currentView === 'history'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Clock className="h-3 w-3 xs:h-4 xs:w-4" />
                  <span>History</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('insights')}
                  className={`flex items-center space-x-1 xs:space-x-1.5 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-colors text-xs xs:text-sm whitespace-nowrap flex-shrink-0 ${
                    currentView === 'insights'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Lightbulb className="h-3 w-3 xs:h-4 xs:w-4" />
                  <span>My Insights</span>
                </button>
                
                <button
                  onClick={() => setIsCustomizationOpen(true)}
                  className="flex items-center space-x-1 xs:space-x-1.5 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition-colors text-xs xs:text-sm whitespace-nowrap flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                >
                  <Settings className="h-3 w-3 xs:h-4 xs:w-4" />
                  <span>Customize</span>
                </button>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-1 xs:space-x-1.5 bg-gradient-to-r from-blue-500 to-green-500 text-white px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg text-xs xs:text-sm whitespace-nowrap flex-shrink-0"
                >
                  <Plus className="h-3 w-3 xs:h-4 xs:w-4" />
                  <span>Add Metrics</span>
                </button>
              </div>
            </div>

            {/* Mobile Dropdown Menu (Alternative) */}
            {isMobileMenuOpen && (
              <div className="border-t border-gray-200 py-2 xs:py-3 bg-gray-50">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleViewChange('dashboard')}
                    className={`flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-2 xs:py-2.5 rounded-lg font-medium transition-colors text-xs xs:text-sm ${
                      currentView === 'dashboard'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <BarChart3 className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleViewChange('trends')}
                    className={`flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-2 xs:py-2.5 rounded-lg font-medium transition-colors text-xs xs:text-sm ${
                      currentView === 'trends'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                    <span>Medical Trends</span>
                  </button>
                  <button
                    onClick={() => handleViewChange('history')}
                    className={`flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-2 xs:py-2.5 rounded-lg font-medium transition-colors text-xs xs:text-sm ${
                      currentView === 'history'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <Clock className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                    <span>History</span>
                  </button>
                  <button
                    onClick={() => handleViewChange('insights')}
                    className={`flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-2 xs:py-2.5 rounded-lg font-medium transition-colors text-xs xs:text-sm ${
                      currentView === 'insights'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <Lightbulb className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                    <span>My Insights</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCustomizationOpen(true)
                      closeMobileMenu()
                    }}
                    className="flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-2 xs:py-2.5 rounded-lg font-medium transition-colors text-xs xs:text-sm text-gray-600 hover:text-gray-900 hover:bg-white"
                  >
                    <Settings className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                    <span>Customize Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(true)
                      closeMobileMenu()
                    }}
                    className="flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-2 xs:py-2.5 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg text-xs xs:text-sm"
                  >
                    <Plus className="h-3 w-3 xs:h-4 xs:w-4 flex-shrink-0" />
                    <span>Add Reading</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-7xl mx-auto">
          {renderCurrentView()}
        </div>
      </main>

      {/* Floating Add Button (Mobile) - Hidden since we have inline button now */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden lg:hidden fixed bottom-3 xs:bottom-4 sm:bottom-6 right-3 xs:right-4 sm:right-6 bg-gradient-to-r from-blue-500 to-green-500 text-white p-2.5 xs:p-3 sm:p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 z-30 opacity-50"
      >
        <Plus className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Add Metric Modal */}
      <AddMetricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMetric={addMetric}
        metricConfigs={metricConfigs}
        metrics={metrics}
      />

      {/* Customization Modal */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        metricConfigs={metricConfigs}
        onOrderChange={handleOrderChange}
        onVisibilityChange={handleVisibilityChange}
        currentOrder={metricOrder}
        visibilitySettings={visibilitySettings}
      />
    </div>
  )
}

export default App
