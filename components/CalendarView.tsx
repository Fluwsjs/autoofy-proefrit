"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Car,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"
import Link from "next/link"

interface Testride {
  id: string
  customerName: string
  customerEmail: string
  carType: string
  date: string
  startTime: string
  endTime: string
  status: string
}

interface CalendarViewProps {
  testrides: Testride[]
}

type ViewMode = "month" | "week" | "day"

export function CalendarView({ testrides }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const daysOfWeek = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
  const daysOfWeekFull = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]

  // Get testrides for a specific date
  const getTestridesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return testrides.filter((t) => {
      const testrideDate = new Date(t.date).toISOString().split('T')[0]
      return testrideDate === dateStr
    })
  }

  // Month view
  const monthView = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7

    const days: Array<{ date: Date; testrides: Testride[] }> = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: new Date(year, month, -startingDayOfWeek + i + 1), testrides: [] })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, testrides: getTestridesForDate(date) })
    }

    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: new Date(year, month + 1, i), testrides: [] })
    }

    return days
  }, [currentDate, testrides])

  // Week view
  const weekView = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    const days: Array<{ date: Date; testrides: Testride[] }> = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push({ date, testrides: getTestridesForDate(date) })
    }
    return days
  }, [currentDate, testrides])

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  // Stats for current view
  const viewStats = useMemo(() => {
    const days = viewMode === "month" ? monthView : weekView
    const relevantDays = days.filter(d => viewMode === "month" ? isCurrentMonth(d.date) : true)
    const totalTestrides = relevantDays.reduce((sum, d) => sum + d.testrides.length, 0)
    const completedTestrides = relevantDays.reduce((sum, d) => 
      sum + d.testrides.filter(t => t.status === "COMPLETED").length, 0
    )
    const daysWithTestrides = relevantDays.filter(d => d.testrides.length > 0).length
    
    return { totalTestrides, completedTestrides, daysWithTestrides }
  }, [monthView, weekView, viewMode])

  const getViewTitle = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
    } else if (viewMode === "week") {
      const start = weekView[0].date
      const end = weekView[6].date
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}`
      }
      return `${start.getDate()} ${start.toLocaleDateString("nl-NL", { month: "short" })} - ${end.getDate()} ${end.toLocaleDateString("nl-NL", { month: "short", year: "numeric" })}`
    } else {
      return formatDate(currentDate.toISOString())
    }
  }

  // Selected day testrides
  const selectedDayTestrides = selectedDate ? getTestridesForDate(selectedDate) : []

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Title & Navigation */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 capitalize">{getViewTitle()}</h2>
                <p className="text-slate-500 text-sm">
                  {viewStats.totalTestrides} proefritten • {viewStats.daysWithTestrides} dagen met afspraken
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className={`px-4 rounded-md capitalize ${
                      viewMode === mode
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode === "month" ? "Maand" : mode === "week" ? "Week" : "Dag"}
                  </Button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate("prev")}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="px-3"
                >
                  Vandaag
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate("next")}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="bg-white border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-4 md:p-6">
            {viewMode === "month" && (
              <div className="grid grid-cols-7 gap-1">
                {/* Header */}
                {daysOfWeek.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                
                {/* Days */}
                {monthView.map((day, index) => {
                  const isCurrentMonthDay = isCurrentMonth(day.date)
                  const isTodayDay = isToday(day.date)
                  const isSelectedDay = isSelected(day.date)
                  const hasTestrides = day.testrides.length > 0
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        relative min-h-[80px] md:min-h-[100px] p-2 rounded-xl text-left transition-all
                        ${isCurrentMonthDay ? "bg-slate-50 hover:bg-slate-100" : "bg-slate-25 opacity-40"}
                        ${isTodayDay ? "ring-2 ring-autoofy-red ring-offset-2" : ""}
                        ${isSelectedDay ? "bg-blue-50 ring-2 ring-blue-500" : ""}
                      `}
                    >
                      <span className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                        ${isTodayDay ? "bg-autoofy-red text-white" : ""}
                        ${isSelectedDay && !isTodayDay ? "bg-blue-500 text-white" : ""}
                      `}>
                        {day.date.getDate()}
                      </span>
                      
                      {hasTestrides && (
                        <div className="mt-1 space-y-1">
                          {day.testrides.slice(0, 2).map((t) => (
                            <div
                              key={t.id}
                              className={`
                                text-xs px-1.5 py-0.5 rounded truncate
                                ${t.status === "COMPLETED" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-blue-100 text-blue-700"
                                }
                              `}
                            >
                              {formatTime(t.startTime)} {t.customerName.split(' ')[0]}
                            </div>
                          ))}
                          {day.testrides.length > 2 && (
                            <div className="text-xs text-slate-400 px-1.5">
                              +{day.testrides.length - 2} meer
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {viewMode === "week" && (
              <div className="grid grid-cols-7 gap-2">
                {weekView.map((day, index) => {
                  const isTodayDay = isToday(day.date)
                  const isSelectedDay = isSelected(day.date)
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        min-h-[300px] p-3 rounded-xl text-left transition-all flex flex-col
                        ${isTodayDay ? "bg-autoofy-red/5 ring-2 ring-autoofy-red" : "bg-slate-50 hover:bg-slate-100"}
                        ${isSelectedDay ? "ring-2 ring-blue-500" : ""}
                      `}
                    >
                      <div className="text-center mb-3">
                        <div className="text-xs text-slate-400 uppercase">{daysOfWeek[index]}</div>
                        <div className={`
                          text-2xl font-bold
                          ${isTodayDay ? "text-autoofy-red" : "text-slate-900"}
                        `}>
                          {day.date.getDate()}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2 overflow-y-auto">
                        {day.testrides.map((t) => (
                          <Link
                            key={t.id}
                            href={`/dashboard/${t.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`
                              block p-2 rounded-lg text-xs transition-colors
                              ${t.status === "COMPLETED"
                                ? "bg-green-100 hover:bg-green-200 text-green-800"
                                : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                              }
                            `}
                          >
                            <div className="font-semibold truncate">{t.customerName}</div>
                            <div className="opacity-75">{formatTime(t.startTime)}</div>
                          </Link>
                        ))}
                        {day.testrides.length === 0 && (
                          <div className="text-xs text-slate-300 text-center mt-8">
                            Geen afspraken
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {viewMode === "day" && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-slate-900">{currentDate.getDate()}</div>
                  <div className="text-slate-500">
                    {daysOfWeekFull[(currentDate.getDay() + 6) % 7]}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {getTestridesForDate(currentDate).map((t) => (
                    <Link
                      key={t.id}
                      href={`/dashboard/${t.id}`}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className={`
                        p-3 rounded-xl
                        ${t.status === "COMPLETED" ? "bg-green-100" : "bg-blue-100"}
                      `}>
                        {t.status === "COMPLETED" 
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <Clock className="h-5 w-5 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{t.customerName}</div>
                        <div className="text-sm text-slate-500">{t.carType}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-900">
                          {formatTime(t.startTime)} - {formatTime(t.endTime)}
                        </div>
                        <div className={`
                          text-xs font-medium
                          ${t.status === "COMPLETED" ? "text-green-600" : "text-blue-600"}
                        `}>
                          {t.status === "COMPLETED" ? "Afgerond" : "Gepland"}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {getTestridesForDate(currentDate).length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Geen proefritten op deze dag</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Detail */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`
                p-2 rounded-lg
                ${selectedDate && isToday(selectedDate) ? "bg-autoofy-red/10" : "bg-slate-100"}
              `}>
                <CalendarIcon className={`
                  h-5 w-5
                  ${selectedDate && isToday(selectedDate) ? "text-autoofy-red" : "text-slate-600"}
                `} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {selectedDate 
                    ? formatDate(selectedDate.toISOString())
                    : "Selecteer een dag"
                  }
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedDayTestrides.length} proefrit{selectedDayTestrides.length !== 1 ? "ten" : ""}
                </p>
              </div>
            </div>

            {selectedDate ? (
              <div className="space-y-3">
                {selectedDayTestrides.length > 0 ? (
                  selectedDayTestrides.map((t) => (
                    <Link
                      key={t.id}
                      href={`/dashboard/${t.id}`}
                      className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-slate-900 group-hover:text-autoofy-red transition-colors">
                          {t.customerName}
                        </div>
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${t.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                          }
                        `}>
                          {t.status === "COMPLETED" ? "Afgerond" : "Gepland"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Car className="h-4 w-4" />
                        {t.carType}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(t.startTime)} - {formatTime(t.endTime)}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Geen proefritten op deze dag</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Klik op een dag om details te zien</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
