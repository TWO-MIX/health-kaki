import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { LucideIcon } from 'lucide-react'
import { HealthMetric } from '../App'

interface MetricChartProps {
  title: string
  icon: LucideIcon
  metrics: HealthMetric[]
  color: string
  bgColor: string
  borderColor: string
  unit: string
  type: HealthMetric['type']
}

const MetricChart: React.FC<MetricChartProps> = ({
  title,
  icon: Icon,
  metrics,
  color,
  bgColor,
  borderColor,
  unit,
  type
}) => {
  // Get last 7 readings for this metric type
  const last7Readings = metrics
    .filter(m => m.type === type)
    .slice(0, 7)
    .reverse() // Show oldest to newest for better chart flow

  // Prepare data for chart
  const chartData = last7Readings.map((metric, index) => {
    let value: number
    let displayValue: string

    if (type === 'blood_pressure') {
      value = metric.systolic || 0
      displayValue = metric.value
    } else {
      value = parseFloat(metric.value)
      displayValue = metric.value
    }

    return {
      index: index + 1,
      value,
      displayValue,
      date: metric.timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      time: metric.timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  })

  const getStrokeColor = () => {
    switch (type) {
      case 'heart_rate': return '#ef4444'
      case 'blood_pressure': return '#3b82f6'
      case 'spo2': return '#10b981'
      case 'blood_sugar': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-lg font-bold" style={{ color: getStrokeColor() }}>
            {data.displayValue} {unit}
          </p>
          <p className="text-sm text-gray-600">{data.date} at {data.time}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`${bgColor} ${borderColor} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-3 ${color} bg-white rounded-lg shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Last 7 readings</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12">
          <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data recorded</p>
          <p className="text-xs text-gray-400 mt-1">Add measurements to see trends</p>
        </div>
      ) : chartData.length === 1 ? (
        <div className="text-center py-8">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {chartData[0].displayValue}
          </div>
          <div className="text-sm text-gray-500 mb-1">{unit}</div>
          <div className="text-xs text-gray-400">
            {chartData[0].date} at {chartData[0].time}
          </div>
          <p className="text-xs text-gray-400 mt-4">Add more readings to see trend graph</p>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getStrokeColor()}
                strokeWidth={3}
                dot={{ fill: getStrokeColor(), strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: getStrokeColor(), strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-gray-600">Latest: </span>
              <span className="font-semibold text-gray-900">
                {chartData[chartData.length - 1].displayValue} {unit}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Trend: </span>
              <span className={`font-semibold ${
                chartData[chartData.length - 1].value > chartData[0].value 
                  ? 'text-red-600' 
                  : chartData[chartData.length - 1].value < chartData[0].value
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}>
                {chartData[chartData.length - 1].value > chartData[0].value 
                  ? '↗ Rising' 
                  : chartData[chartData.length - 1].value < chartData[0].value
                  ? '↘ Falling'
                  : '→ Stable'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MetricChart
