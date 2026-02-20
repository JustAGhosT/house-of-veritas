"use client"

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Car,
  Wrench,
  TrendingUp,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  CalendarPlus,
  CheckCircle,
} from 'lucide-react'

interface Prediction {
  assetId: string
  assetName: string
  prediction: string
  urgency: 'high' | 'medium' | 'low'
  estimatedCost: number
  recommendedAction: string
  dueDate: string
}

interface MaintenanceData {
  success: boolean
  generatedAt: string
  aiPowered: boolean
  predictions: Prediction[]
  insights: string[]
  urgentItems: Prediction[]
  costForecast: { month: string; estimated: number }[]
}

export function PredictiveMaintenancePanel() {
  const [data, setData] = useState<MaintenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scheduling, setScheduling] = useState(false)
  const [filter, setFilter] = useState<'all' | 'vehicle' | 'equipment'>('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?type=${filter}` : ''
      const response = await fetch(`/api/ai/maintenance${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch maintenance predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  const urgencyColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-white/50">
        Failed to load maintenance data
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Predictive Maintenance</h2>
            <p className="text-white/50 text-sm">
              {data.aiPowered ? 'AI-Powered Analysis' : 'Standard Analysis'} • 
              Updated {new Date(data.generatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Assets</option>
            <option value="vehicle">Vehicles</option>
            <option value="equipment">Equipment</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Urgent Items Alert */}
      {data.urgentItems.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">
              {data.urgentItems.length} Urgent Item{data.urgentItems.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {data.urgentItems.map((item) => (
              <div key={item.assetId} className="flex items-center justify-between text-sm">
                <span className="text-white">{item.assetName}</span>
                <span className="text-red-400">{item.recommendedAction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Assets Analyzed"
          value={data.predictions.length}
          icon={Wrench}
          color="blue"
        />
        <SummaryCard
          title="Urgent Items"
          value={data.urgentItems.length}
          icon={AlertTriangle}
          color="red"
        />
        <SummaryCard
          title="Avg Est. Cost"
          value={`R${Math.round(data.predictions.reduce((sum, p) => sum + p.estimatedCost, 0) / data.predictions.length)}`}
          icon={DollarSign}
          color="purple"
        />
        <SummaryCard
          title="Next Month"
          value={`R${data.costForecast[0]?.estimated || 0}`}
          icon={Calendar}
          color="green"
        />
      </div>

      {/* AI Insights */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Key Insights
        </h3>
        <ul className="space-y-2">
          {data.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-white/70">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {/* Predictions Table */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Maintenance Predictions</h3>
        </div>
        <div className="divide-y divide-white/5">
          {data.predictions.map((prediction) => (
            <div key={prediction.assetId} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    prediction.assetName.includes('Toyota') || prediction.assetName.includes('Ford')
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {prediction.assetName.includes('Toyota') || prediction.assetName.includes('Ford')
                      ? <Car className="w-4 h-4" />
                      : <Wrench className="w-4 h-4" />
                    }
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{prediction.assetName}</h4>
                    <p className="text-white/60 text-sm mt-1">{prediction.prediction}</p>
                    <p className="text-white/40 text-xs mt-2">
                      Action: {prediction.recommendedAction}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs border ${urgencyColors[prediction.urgency]}`}>
                    {prediction.urgency}
                  </span>
                  <p className="text-white/60 text-sm mt-2">R{prediction.estimatedCost}</p>
                  <p className="text-white/40 text-xs">Due: {prediction.dueDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Forecast */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-white font-semibold mb-4">6-Month Cost Forecast</h3>
        <div className="flex items-end gap-2 h-32">
          {data.costForecast.map((forecast, index) => {
            const maxCost = Math.max(...data.costForecast.map(f => f.estimated))
            const height = (forecast.estimated / maxCost) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-white/40">{forecast.month.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <span className="text-white/50">Total Forecast:</span>
          <span className="text-white font-semibold">
            R{data.costForecast.reduce((sum, f) => sum + f.estimated, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon: Icon, color }: {
  title: string
  value: string | number
  icon: any
  color: 'blue' | 'red' | 'purple' | 'green'
}) {
  const colors = {
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/30 text-red-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    green: 'from-green-600/20 to-green-600/5 border-green-500/30 text-green-400',
  }

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  )
}

export default PredictiveMaintenancePanel
