"use client"

import { useMemo } from "react"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  Calendar, 
  Car, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from "lucide-react"

interface Testride {
  date: string
  status: string
  carType?: string
}

interface AnalyticsChartProps {
  testrides: Testride[]
}

export function AnalyticsChart({ testrides }: AnalyticsChartProps) {
  // Prepare data for last 30 days
  const chartData = useMemo(() => {
    const days = 30
    const data: Array<{ date: string; fullDate: string; count: number; completed: number }> = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      data.push({
        date: date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
        fullDate: dateStr,
        count: 0,
        completed: 0
      })
    }
    
    testrides.forEach((testride) => {
      const testrideDate = new Date(testride.date).toISOString().split('T')[0]
      const today = new Date()
      const daysAgo = Math.floor((today.getTime() - new Date(testrideDate).getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysAgo >= 0 && daysAgo < days) {
        const index = days - 1 - daysAgo
        if (index >= 0 && index < data.length) {
          data[index].count++
          if (testride.status === 'COMPLETED') {
            data[index].completed++
          }
        }
      }
    })
    
    return data
  }, [testrides])

  // Prepare monthly data
  const monthlyData = useMemo(() => {
    const months: Record<string, { total: number; completed: number }> = {}
    
    testrides.forEach((testride) => {
      const date = new Date(testride.date)
      const monthKey = date.toLocaleDateString('nl-NL', { month: 'short' })
      
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, completed: 0 }
      }
      
      months[monthKey].total++
      if (testride.status === 'COMPLETED') {
        months[monthKey].completed++
      }
    })
    
    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .slice(-6)
  }, [testrides])

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisWeek = new Date(now)
    thisWeek.setDate(thisWeek.getDate() - 7)

    const thisMonthRides = testrides.filter((t) => new Date(t.date) >= thisMonth)
    const lastMonthRides = testrides.filter((t) => {
      const date = new Date(t.date)
      return date >= lastMonth && date < thisMonth
    })
    
    const completed = testrides.filter((t) => t.status === "COMPLETED").length
    const thisWeekRides = testrides.filter((t) => new Date(t.date) >= thisWeek)
    
    const monthGrowth = lastMonthRides.length > 0 
      ? ((thisMonthRides.length - lastMonthRides.length) / lastMonthRides.length * 100)
      : thisMonthRides.length > 0 ? 100 : 0

    // Calculate average per day (last 30 days)
    const last30DaysCount = chartData.reduce((sum, d) => sum + d.count, 0)
    const avgPerDay = (last30DaysCount / 30).toFixed(1)

    // Completion rate
    const completionRate = testrides.length > 0 
      ? Math.round((completed / testrides.length) * 100) 
      : 0

    return {
      total: testrides.length,
      thisMonth: thisMonthRides.length,
      lastMonth: lastMonthRides.length,
      thisWeek: thisWeekRides.length,
      completed,
      monthGrowth,
      avgPerDay,
      completionRate
    }
  }, [testrides, chartData])

  // Top cars
  const topCars = useMemo(() => {
    const carCounts: Record<string, number> = {}
    testrides.forEach((t) => {
      if (t.carType) {
        carCounts[t.carType] = (carCounts[t.carType] || 0) + 1
      }
    })
    return Object.entries(carCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [testrides])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-medium text-slate-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Car className="h-5 w-5 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Totaal</span>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-blue-100 text-sm">Proefritten</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{stats.completionRate}%</span>
            </div>
            <p className="text-3xl font-bold">{stats.completed}</p>
            <p className="text-emerald-100 text-sm">Afgerond</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 border-0 shadow-lg text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 opacity-80" />
              {stats.monthGrowth !== 0 && (
                <span className={`text-xs flex items-center gap-0.5 ${stats.monthGrowth > 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {stats.monthGrowth > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(Math.round(stats.monthGrowth))}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold">{stats.thisMonth}</p>
            <p className="text-violet-100 text-sm">Deze maand</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 shadow-lg text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Gem.</span>
            </div>
            <p className="text-3xl font-bold">{stats.avgPerDay}</p>
            <p className="text-amber-100 text-sm">Per dag (30d)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Proefritten Trend</h3>
                <p className="text-sm text-slate-500">Laatste 30 dagen</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D3557" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1D3557" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1D3557" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  name="Totaal"
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  name="Afgerond"
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1D3557]" />
                <span className="text-sm text-slate-600">Totaal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Afgerond</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Bar Chart */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-autoofy-red to-red-600 rounded-xl shadow-lg shadow-red-500/25">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Per Maand</h3>
                <p className="text-sm text-slate-500">Laatste 6 maanden</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="total" 
                  fill="#1D3557" 
                  name="Totaal"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="completed" 
                  fill="#10b981" 
                  name="Afgerond"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1D3557]" />
                <span className="text-sm text-slate-600">Totaal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Afgerond</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Card */}
        <Card className="bg-white border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Maand Vergelijking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Deze maand</p>
                <p className="text-3xl font-bold text-slate-900">{stats.thisMonth}</p>
                <div className="flex items-center gap-2 mt-2">
                  {stats.monthGrowth > 0 ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      {Math.round(stats.monthGrowth)}% groei
                    </span>
                  ) : stats.monthGrowth < 0 ? (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <ArrowDownRight className="h-4 w-4" />
                      {Math.abs(Math.round(stats.monthGrowth))}% daling
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Geen verandering</span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Vorige maand</p>
                <p className="text-3xl font-bold text-slate-900">{stats.lastMonth}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-400">Referentie periode</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Cars */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Car className="h-5 w-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Top Auto's</h3>
            </div>
            {topCars.length > 0 ? (
              <div className="space-y-3">
                {topCars.map(([car, count], index) => (
                  <div key={car} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
                      `}>
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-700 truncate max-w-[120px]">{car}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Car className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Geen data beschikbaar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
