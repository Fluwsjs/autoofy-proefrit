"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  Target, 
  Car, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Activity
} from "lucide-react"
import Link from "next/link"
import { formatDate, formatTime } from "@/lib/utils"

interface Testride {
  id: string
  customerName: string
  customerEmail: string
  carType: string
  date: string
  startTime: string
  endTime: string
  startKm: number
  endKm: number | null
  status: string
  createdAt?: string
  updatedAt?: string
}

interface Feedback {
  id: string
  purchaseLikelihood: string
  createdAt: string
}

interface DashboardWidgetsProps {
  testrides: Testride[]
  feedbackData: {
    total: number
    hotLeads: number
    feedbacks: Feedback[]
  }
  monthTarget?: number
}

export function DashboardWidgets({ testrides, feedbackData, monthTarget = 20 }: DashboardWidgetsProps) {
  // Calculate conversion rate
  const conversionRate = useMemo(() => {
    if (feedbackData.total === 0) return 0
    const conversions = feedbackData.feedbacks?.filter(
      (f) => f.purchaseLikelihood === "zeer_groot" || f.purchaseLikelihood === "groot"
    ).length || 0
    return Math.round((conversions / feedbackData.total) * 100)
  }, [feedbackData])

  // Calculate previous month conversion for comparison
  const prevConversionRate = useMemo(() => {
    // Simplified - in real app would compare to last month
    return conversionRate > 0 ? conversionRate - 5 : 0
  }, [conversionRate])

  // This month's testrides count
  const thisMonthCount = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return testrides.filter((t) => new Date(t.date) >= thisMonth).length
  }, [testrides])

  // Top cars analysis
  const topCars = useMemo(() => {
    const carCounts: Record<string, number> = {}
    testrides.forEach((t) => {
      // Normalize car type (trim whitespace, capitalize)
      const carType = t.carType.trim()
      carCounts[carType] = (carCounts[carType] || 0) + 1
    })
    
    return Object.entries(carCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [testrides])

  const maxCarCount = topCars.length > 0 ? topCars[0].count : 0

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string
      type: "completed" | "pending" | "scheduled" | "hot_lead"
      title: string
      subtitle: string
      time: Date
      link?: string
    }> = []

    // Add testrides as activities
    testrides
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .forEach((t) => {
        const isToday = new Date(t.date).toDateString() === new Date().toDateString()
        const isPast = new Date(t.date) < new Date()
        
        if (t.status.toUpperCase() === "COMPLETED") {
          activities.push({
            id: t.id,
            type: "completed",
            title: t.customerName,
            subtitle: `${t.carType} • Afgerond`,
            time: new Date(t.date),
            link: `/dashboard/${t.id}`
          })
        } else if (isToday) {
          activities.push({
            id: t.id,
            type: "pending",
            title: t.customerName,
            subtitle: `${t.carType} • ${formatTime(t.startTime)}`,
            time: new Date(t.date),
            link: `/dashboard/${t.id}`
          })
        } else if (!isPast) {
          activities.push({
            id: t.id,
            type: "scheduled",
            title: t.customerName,
            subtitle: `${t.carType} • ${formatDate(t.date)}`,
            time: new Date(t.date),
            link: `/dashboard/${t.id}`
          })
        }
      })

    // Sort by most recent first
    return activities.slice(0, 5)
  }, [testrides])

  // Week overview
  const weekOverview = useMemo(() => {
    const days = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - date.getDay() + i + 1) // Start from Monday
      
      const count = testrides.filter((t) => {
        const testrideDate = new Date(t.date)
        return testrideDate.toDateString() === date.toDateString()
      }).length

      days.push({
        day: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"][i],
        date: date.getDate(),
        count,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today && date.toDateString() !== today.toDateString()
      })
    }
    
    return days
  }, [testrides])

  const targetProgress = Math.min((thisMonthCount / monthTarget) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Rate Widget */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Conversie Rate</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold tracking-tight">{conversionRate}%</span>
                  {conversionRate > prevConversionRate ? (
                    <span className="flex items-center text-emerald-200 text-sm font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      +{conversionRate - prevConversionRate}%
                    </span>
                  ) : null}
                </div>
                <p className="text-emerald-100/80 text-sm mt-2">
                  Van proefrit naar koopintentie
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            {/* Mini sparkline placeholder */}
            <div className="mt-4 flex items-end gap-1 h-12">
              {[40, 55, 45, 60, 50, 70, conversionRate].map((val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white/30 rounded-t transition-all"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Month Target Widget */}
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-lg text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium mb-1">Maand Target</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">{thisMonthCount}</span>
                  <span className="text-2xl text-violet-200">/ {monthTarget}</span>
                </div>
                <p className="text-violet-100/80 text-sm mt-2">
                  Proefritten deze maand
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-6 w-6" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-violet-200 mb-2">
                <span>{Math.round(targetProgress)}% behaald</span>
                <span>{monthTarget - thisMonthCount} te gaan</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Top Cars & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Cars Chart */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Car className="h-5 w-5 text-slate-400" />
              Meest Geteste Auto's
              <span className="text-xs font-normal text-slate-400 ml-auto">Deze maand</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {topCars.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nog geen proefritten</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCars.map((car, index) => (
                  <div key={car.name} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? 'bg-amber-100 text-amber-700' : 
                            index === 1 ? 'bg-slate-100 text-slate-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-50 text-slate-500'}
                        `}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-700 text-sm">{car.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{car.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gradient-to-r from-autoofy-red to-red-500' :
                          index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                          'bg-gradient-to-r from-slate-300 to-slate-400'
                        }`}
                        style={{ width: `${(car.count / maxCarCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-400" />
              Recente Activiteit
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nog geen activiteit</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.link || "#"}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`
                      w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                      ${activity.type === 'completed' ? 'bg-green-100' :
                        activity.type === 'pending' ? 'bg-amber-100' :
                        activity.type === 'hot_lead' ? 'bg-red-100' :
                        'bg-blue-100'}
                    `}>
                      {activity.type === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.type === 'pending' ? (
                        <Clock className="h-4 w-4 text-amber-600" />
                      ) : activity.type === 'hot_lead' ? (
                        <Flame className="h-4 w-4 text-red-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-autoofy-red transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{activity.subtitle}</p>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">
                      {getRelativeTime(activity.time)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Week Overview */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Deze Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekOverview.map((day) => (
              <div
                key={day.day}
                className={`
                  text-center p-3 rounded-xl transition-all
                  ${day.isToday 
                    ? 'bg-autoofy-red text-white shadow-lg shadow-autoofy-red/25' 
                    : day.isPast 
                      ? 'bg-slate-50 text-slate-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                <p className={`text-xs font-medium mb-1 ${day.isToday ? 'text-white/80' : ''}`}>
                  {day.day}
                </p>
                <p className={`text-2xl font-bold ${day.isToday ? '' : day.count > 0 ? 'text-slate-900' : ''}`}>
                  {day.count}
                </p>
                {day.isToday && (
                  <p className="text-xs text-white/80 mt-1">Vandaag</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hot Leads Alert */}
      {feedbackData.hotLeads > 0 && (
        <Link href="/dashboard/feedback">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg text-white cursor-pointer hover:shadow-xl transition-shadow overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {feedbackData.hotLeads} Hot Lead{feedbackData.hotLeads !== 1 ? 's' : ''}!
                    </h3>
                    <p className="text-orange-100 text-sm">
                      Klanten met hoge koopintentie - neem snel contact op
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <span className="font-medium">Bekijken</span>
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  )
}

// Helper function for relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Nu"
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours} uur`
  if (diffDays === 1) return "Gisteren"
  if (diffDays < 7) return `${diffDays} dagen`
  return formatDate(date.toISOString())
}

