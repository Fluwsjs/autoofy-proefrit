"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
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

  const daysOfWeek = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]

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
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0

    const days: Array<{ date: Date; testrides: Testride[] }> = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: new Date(year, month, -startingDayOfWeek + i + 1), testrides: [] })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, testrides: getTestridesForDate(date) })
    }

    // Fill remaining cells to complete the grid
    const remainingCells = 42 - days.length // 6 weeks * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: new Date(year, month + 1, i), testrides: [] })
    }

    return days
  }, [currentDate, testrides])

  // Week view
  const weekView = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    startOfWeek.setDate(diff)

    const days: Array<{ date: Date; testrides: Testride[] }> = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push({ date, testrides: getTestridesForDate(date) })
    }
    return days
  }, [currentDate, testrides])

  // Day view
  const dayView = useMemo(() => {
    return [{ date: currentDate, testrides: getTestridesForDate(currentDate) }]
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

  const renderCalendar = () => {
    const days = viewMode === "month" ? monthView : viewMode === "week" ? weekView : dayView

    if (viewMode === "month") {
      return (
        <>
          {/* Desktop: Grid View */}
          <div className="hidden md:grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const isCurrentMonthDay = isCurrentMonth(day.date)
              const isTodayDay = isToday(day.date)
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    isCurrentMonthDay ? "bg-white" : "bg-muted/30"
                  } ${isTodayDay ? "ring-2 ring-autoofy-red" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isTodayDay ? "text-autoofy-red" : ""}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.testrides.slice(0, 3).map((testride) => (
                      <Link
                        key={testride.id}
                        href={`/dashboard/${testride.id}`}
                        className="block text-xs p-1 rounded bg-autoofy-dark/10 hover:bg-autoofy-dark/20 transition-colors truncate"
                        title={`${testride.customerName} - ${testride.carType}`}
                      >
                        <div className="font-medium truncate">{testride.customerName}</div>
                        <div className="text-muted-foreground truncate">{formatTime(testride.startTime)}</div>
                      </Link>
                    ))}
                    {day.testrides.length > 3 && (
                      <div className="text-xs text-muted-foreground p-1">
                        +{day.testrides.length - 3} meer
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Mobile: Compact List View */}
          <div className="md:hidden space-y-2">
            {days
              .filter(day => isCurrentMonth(day.date) && day.testrides.length > 0)
              .map((day, index) => {
                const isTodayDay = isToday(day.date)
                return (
                  <div key={index} className={`border rounded-lg overflow-hidden ${isTodayDay ? "ring-2 ring-autoofy-red" : ""}`}>
                    <div className={`px-3 py-2 font-semibold text-sm ${isTodayDay ? "bg-autoofy-red text-white" : "bg-slate-100 text-slate-900"}`}>
                      {formatDate(day.date.toISOString())}
                      <span className="ml-2 text-xs font-normal opacity-80">
                        ({day.testrides.length} {day.testrides.length === 1 ? "proefrit" : "proefritten"})
                      </span>
                    </div>
                    <div className="divide-y">
                      {day.testrides.map((testride) => (
                        <Link
                          key={testride.id}
                          href={`/dashboard/${testride.id}`}
                          className="block p-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-slate-900 truncate">{testride.customerName}</div>
                              <div className="text-xs text-slate-600 truncate">{testride.carType}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs font-medium text-slate-900">
                                {formatTime(testride.startTime)}
                              </div>
                              <div className={`text-xs px-2 py-0.5 rounded mt-1 ${
                                testride.status === "COMPLETED" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {testride.status === "COMPLETED" ? "Afgerond" : "Actief"}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            {days.filter(day => isCurrentMonth(day.date) && day.testrides.length > 0).length === 0 && (
              <div className="text-center py-12 text-muted-foreground border rounded-lg">
                Geen proefritten deze maand
              </div>
            )}
          </div>
        </>
      )
    } else if (viewMode === "week") {
      return (
        <>
          {/* Desktop: 7-column grid */}
          <div className="hidden lg:grid grid-cols-7 gap-4">
            {days.map((day, index) => {
              const isTodayDay = isToday(day.date)
              return (
                <div key={index} className="border rounded-lg p-4 min-h-[400px]">
                  <div className={`text-lg font-semibold mb-4 ${isTodayDay ? "text-autoofy-red" : ""}`}>
                    {daysOfWeek[index]} {day.date.getDate()}
                  </div>
                  <div className="space-y-2">
                    {day.testrides.map((testride) => (
                      <Link
                        key={testride.id}
                        href={`/dashboard/${testride.id}`}
                        className="block p-2 rounded bg-autoofy-dark/10 hover:bg-autoofy-dark/20 transition-colors"
                      >
                        <div className="font-medium text-sm">{testride.customerName}</div>
                        <div className="text-xs text-muted-foreground">{testride.carType}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(testride.startTime)} - {formatTime(testride.endTime)}
                        </div>
                      </Link>
                    ))}
                    {day.testrides.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        Geen proefritten
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Mobile & Tablet: Single column */}
          <div className="lg:hidden space-y-3">
            {days.map((day, index) => {
              const isTodayDay = isToday(day.date)
              return (
                <div key={index} className={`border rounded-lg overflow-hidden ${isTodayDay ? "ring-2 ring-autoofy-red" : ""}`}>
                  <div className={`px-4 py-2 font-semibold ${isTodayDay ? "bg-autoofy-red text-white" : "bg-slate-100 text-slate-900"}`}>
                    {daysOfWeek[index]} {day.date.getDate()}
                    {day.testrides.length > 0 && (
                      <span className="ml-2 text-xs font-normal opacity-80">
                        ({day.testrides.length})
                      </span>
                    )}
                  </div>
                  {day.testrides.length > 0 ? (
                    <div className="divide-y">
                      {day.testrides.map((testride) => (
                        <Link
                          key={testride.id}
                          href={`/dashboard/${testride.id}`}
                          className="block p-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          <div className="font-medium text-sm">{testride.customerName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{testride.carType}</div>
                          <div className="text-xs text-slate-600 mt-1">
                            {formatTime(testride.startTime)} - {formatTime(testride.endTime)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Geen proefritten
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )
    } else {
      // Day view
      const day = days[0]
      const isTodayDay = isToday(day.date)
      
      return (
        <div className="space-y-4">
          <div className={`text-2xl font-bold mb-4 ${isTodayDay ? "text-autoofy-red" : ""}`}>
            {formatDate(day.date.toISOString())}
          </div>
          <div className="space-y-3">
            {day.testrides.map((testride) => (
              <Link
                key={testride.id}
                href={`/dashboard/${testride.id}`}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{testride.customerName}</div>
                    <div className="text-sm text-muted-foreground">{testride.customerEmail}</div>
                    <div className="text-sm font-medium mt-1">{testride.carType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatTime(testride.startTime)} - {formatTime(testride.endTime)}
                    </div>
                    <div className={`text-xs mt-1 px-2 py-1 rounded ${
                      testride.status === "COMPLETED" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {testride.status === "COMPLETED" ? "Afgerond" : "Bezig met testrit"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {day.testrides.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Geen proefritten op deze dag
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  const getViewTitle = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
    } else if (viewMode === "week") {
      const start = viewMode === "week" ? weekView[0].date : currentDate
      const end = viewMode === "week" ? weekView[6].date : currentDate
      return `${formatDate(start.toISOString())} - ${formatDate(end.toISOString())}`
    } else {
      return formatDate(currentDate.toISOString())
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-autoofy-dark to-autoofy-dark/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Kalender
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 w-full sm:w-auto">
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                className={`flex-1 sm:flex-none min-h-[44px] text-xs sm:text-sm ${viewMode === "month" ? "bg-white text-autoofy-dark" : "text-white hover:bg-white/20"}`}
              >
                Maand
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
                className={`flex-1 sm:flex-none min-h-[44px] text-xs sm:text-sm ${viewMode === "week" ? "bg-white text-autoofy-dark" : "text-white hover:bg-white/20"}`}
              >
                Week
              </Button>
              <Button
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("day")}
                className={`flex-1 sm:flex-none min-h-[44px] text-xs sm:text-sm ${viewMode === "day" ? "bg-white text-autoofy-dark" : "text-white hover:bg-white/20"}`}
              >
                Dag
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
              className="hover:bg-autoofy-dark hover:text-white min-w-[44px] min-h-[44px] p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold min-w-[180px] sm:min-w-[200px] text-center">
              {getViewTitle()}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
              className="hover:bg-autoofy-dark hover:text-white min-w-[44px] min-h-[44px] p-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hover:bg-autoofy-red hover:text-white w-full sm:w-auto min-h-[44px]"
          >
            Vandaag
          </Button>
        </div>
        <div className="overflow-x-auto">
          {renderCalendar()}
        </div>
      </CardContent>
    </Card>
  )
}

