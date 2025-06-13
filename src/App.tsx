import React, { useState, useEffect } from 'react'
import { Heart, Activity, Droplets, Gauge, Plus, BarChart3, Clock, Lightbulb, Menu, X } from 'lucide-react'
import AddMetricModal from './components/AddMetricModal'
import Dashboard from './components/Dashboard'
import HistoryView from './components/HistoryView'
import HealthInsights from './components/HealthInsights'

export interface HealthMetric {
  id: string
  type: 'heart_rate' | 'blood_pressure' | 'spo2' | 'blood_sugar'
  value: string
  systolic?: number
  diastolic?: number
  timestamp: Date
  notes?: string
}

type ViewType = 'dashboard' | 'history' | 'insights'

const App: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            metrics={metrics}
            metricConfigs={metricConfigs}
            getLatestMetric={getLatestMetric}
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
      default:
        return null
    }
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard'
      case 'history':
        return 'History'
      case 'insights':
        return 'My Insights'
      default:
        return 'Health Kaki'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Health Kaki</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Your personal health companion</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'history'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                History
              </button>
              <button
                onClick={() => setCurrentView('insights')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'insights'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Lightbulb className="h-4 w-4 inline mr-2" />
                My Insights
              </button>
            </nav>

            {/* Desktop Add Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Add Reading</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleViewChange('dashboard')}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleViewChange('history')}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentView === 'history'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => handleViewChange('insights')}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentView === 'insights'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Lightbulb className="h-5 w-5" />
                  <span>My Insights</span>
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(true)
                    closeMobileMenu()
                  }}
                  className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Reading</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      {/* Floating Add Button (Mobile) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 z-30"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Metric Modal */}
      <AddMetricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMetric={addMetric}
        metricConfigs={metricConfigs}
        metrics={metrics}
      />
    </div>
  )
}

export default App
