"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/DataTable"
import { SearchAndFilter } from "@/components/SearchAndFilter"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, TrendingUp, Calendar, Car, Clock, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight, MessageSquare } from "lucide-react"
import Link from "next/link"
import { SkeletonCard, SkeletonTable, SkeletonHeader } from "@/components/SkeletonLoader"
import { AnalyticsChart } from "@/components/AnalyticsChart"
import { CalendarView } from "@/components/CalendarView"
import { WelcomeWizard } from "@/components/WelcomeWizard"
import { MobileTestRideCard } from "@/components/MobileTestRideCard"
import { DashboardWidgets } from "@/components/DashboardWidgets"

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
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast, ToastComponent } = useToast()
  const [testrides, setTestrides] = useState<Testride[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "analytics">("table")
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [companyInfoComplete, setCompanyInfoComplete] = useState(false)
  const [hasDealerPlates, setHasDealerPlates] = useState(false)
  const [feedbackStats, setFeedbackStats] = useState<{ total: number; hotLeads: number; feedbacks: any[] }>({ total: 0, hotLeads: 0, feedbacks: [] })
  const [monthlyTarget, setMonthlyTarget] = useState(20)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchTestrides()
      checkOnboardingStatus()
      fetchFeedbackStats()
      fetchMonthlyTarget()
    }
  }, [session])
  
  const fetchMonthlyTarget = async () => {
    try {
      const response = await fetch("/api/company-info")
      if (response.ok) {
        const data = await response.json()
        if (data.monthlyTarget) {
          setMonthlyTarget(data.monthlyTarget)
        }
      }
    } catch (error) {
      console.error("Error fetching monthly target:", error)
    }
  }
  
  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch("/api/feedback")
      if (response.ok) {
        const data = await response.json()
        const feedbacks = data.feedbacks || []
        const hotLeads = feedbacks.filter((f: any) => 
          f.purchaseLikelihood === "zeer_groot" || f.purchaseLikelihood === "groot"
        ).length || 0
        setFeedbackStats({
          total: data.stats?.total || 0,
          hotLeads,
          feedbacks
        })
      }
    } catch (error) {
      console.error("Error fetching feedback stats:", error)
    }
  }
  
  // Re-check onboarding status when wizard is opened
  useEffect(() => {
    if (showWelcomeWizard && session) {
      checkOnboardingStatus()
    }
  }, [showWelcomeWizard])
  
  const checkOnboardingStatus = async () => {
    try {
      // Check if wizard has been dismissed before - if so, NEVER show again
      const wizardDismissed = localStorage.getItem('welcomeWizardDismissed')
      if (wizardDismissed === 'true') {
        // User has dismissed the wizard before, don't show it again
        // But still fetch the data for other purposes
        try {
          const companyResponse = await fetch("/api/company-info")
          if (companyResponse.ok) {
            const companyData = await companyResponse.json()
            setCompanyInfoComplete(!!(companyData.companyName && companyData.companyAddress))
          }
        } catch (err) {
          console.error("Error fetching company info:", err)
        }
        
        try {
          const platesResponse = await fetch("/api/dealer-plates")
          if (platesResponse.ok) {
            const platesResult = await platesResponse.json()
            const plates = platesResult.data || platesResult
            setHasDealerPlates(plates.length > 0)
          }
        } catch (err) {
          console.error("Error fetching dealer plates:", err)
        }
        return // Don't show wizard
      }
      
      // Check company info
      try {
        const companyResponse = await fetch("/api/company-info")
        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          setCompanyInfoComplete(!!(companyData.companyName && companyData.companyAddress))
        } else {
          setCompanyInfoComplete(false)
        }
      } catch (err) {
        console.error("Error fetching company info:", err)
        setCompanyInfoComplete(false)
      }
      
      // Check dealer plates
      try {
        const platesResponse = await fetch("/api/dealer-plates")
        if (platesResponse.ok) {
          const platesResult = await platesResponse.json()
          const plates = platesResult.data || platesResult
          setHasDealerPlates(plates.length > 0)
        }
      } catch (err) {
        console.error("Error fetching dealer plates:", err)
        setHasDealerPlates(false)
      }
      
      // Check if we should open wizard from query params
      // Security: Only accept specific known parameter values
      const openWizard = searchParams.get("openWizard")
      const stepParam = searchParams.get("step")
      if (openWizard === "true") {
        // Validate step is a number between 0-10
        const step = stepParam ? parseInt(stepParam, 10) : 0
        if (!isNaN(step) && step >= 0 && step <= 10) {
          setWizardStep(step)
        } else {
          setWizardStep(0)
        }
        setShowWelcomeWizard(true)
        router.replace("/dashboard")
        return
      }
      
      // Show wizard only if never shown before (first time users)
      const wizardShown = localStorage.getItem('welcomeWizardShown')
      if (!wizardShown) {
        setShowWelcomeWizard(true)
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
      // On error, only show wizard if never shown before
      const wizardShown = localStorage.getItem('welcomeWizardShown')
      if (!wizardShown) {
        setShowWelcomeWizard(true)
      }
    }
  }
  
  const handleCloseWizard = () => {
    setShowWelcomeWizard(false)
    localStorage.setItem('welcomeWizardShown', 'true')
    localStorage.setItem('welcomeWizardDismissed', 'true') // Permanent dismissal - never show again
  }

  useEffect(() => {
    // Security: Only accept exact expected parameter values (whitelist approach)
    const success = searchParams.get("success")
    if (success === "true") {
      showToast("Proefrit succesvol aangemaakt!", "success")
      router.replace("/dashboard")
    }
    
    // Clean up any unexpected URL parameters for security
    const allowedParams = ["success", "openWizard", "step"]
    const currentParams = Array.from(searchParams.keys())
    const hasUnexpectedParams = currentParams.some(p => !allowedParams.includes(p))
    if (hasUnexpectedParams && currentParams.length > 0) {
      // Strip unknown parameters
      router.replace("/dashboard")
    }
  }, [searchParams, router, showToast])

  const fetchTestrides = async () => {
    try {
      const response = await fetch("/api/testrides")
      if (response.ok) {
        const result = await response.json()
        // Handle paginated response: { data: [...], pagination: {...} }
        const testrides = result.data || result
        setTestrides(testrides)
      }
    } catch (error) {
      console.error("Error fetching testrides:", error)
      showToast("Fout bij ophalen proefritten", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Weet u zeker dat u deze proefrit wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/testrides/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTestrides(testrides.filter((t) => t.id !== id))
        showToast("Proefrit succesvol verwijderd", "success")
      } else {
        showToast("Fout bij verwijderen proefrit", "error")
      }
    } catch (error) {
      console.error("Error deleting testride:", error)
      showToast("Fout bij verwijderen proefrit", "error")
    }
  }

  // Filter and search logic
  const filteredTestrides = useMemo(() => {
    let filtered = [...testrides]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.customerName.toLowerCase().includes(query) ||
          t.customerEmail.toLowerCase().includes(query) ||
          t.carType.toLowerCase().includes(query)
      )
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter((t) => {
        const testrideDate = new Date(t.date)
        
        switch (dateFilter) {
          case "today":
            return testrideDate >= today
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return testrideDate >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return testrideDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered
  }, [testrides, searchQuery, dateFilter])

  // Statistics
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisWeek = new Date(now)
    thisWeek.setDate(thisWeek.getDate() - 7)

    const thisMonthRides = testrides.filter((t) => new Date(t.date) >= thisMonth)
    const lastMonthRides = testrides.filter((t) => {
      const date = new Date(t.date)
      return date >= lastMonth && date < thisMonth
    })
    
    const completed = testrides.filter((t) => t.status.toUpperCase() === "COMPLETED").length
    const pending = testrides.filter((t) => t.status.toUpperCase() === "PENDING").length

    const monthGrowth = lastMonthRides.length > 0 
      ? ((thisMonthRides.length - lastMonthRides.length) / lastMonthRides.length * 100).toFixed(1)
      : thisMonthRides.length > 0 ? '100' : '0'

    return {
      total: testrides.length,
      thisMonth: thisMonthRides.length,
      thisWeek: testrides.filter((t) => new Date(t.date) >= thisWeek).length,
      completed,
      pending,
      monthGrowth: parseFloat(monthGrowth),
      today: testrides.filter((t) => {
        const testrideDate = new Date(t.date)
        return testrideDate.toDateString() === today.toDateString()
      }).length,
    }
  }, [testrides])

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <SkeletonHeader />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {ToastComponent}
      
      {/* Welcome Wizard */}
      {showWelcomeWizard && (
        <WelcomeWizard
          onClose={handleCloseWizard}
          companyInfoComplete={companyInfoComplete}
          hasDealerPlates={hasDealerPlates}
          hasTestrides={testrides.length > 0}
          initialStep={wizardStep}
        />
      )}
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">
            Welkom terug, {session?.user?.name?.split(' ')[0] || ""}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-0.5 sm:mt-1">
            Overzicht van je proefritten
          </p>
        </div>
        <div className="flex items-center w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-lg sm:rounded-xl p-0.5 shadow-sm border border-slate-200 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={`text-xs px-2 sm:px-4 h-8 sm:h-9 rounded-md sm:rounded-lg transition-all flex-1 sm:flex-initial min-w-0 ${
                viewMode === "table" 
                  ? "bg-autoofy-dark text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              📋
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={`text-xs px-2 sm:px-4 h-8 sm:h-9 rounded-md sm:rounded-lg transition-all flex-1 sm:flex-initial min-w-0 ${
                viewMode === "calendar" 
                  ? "bg-autoofy-dark text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              📅
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("analytics")}
              className={`text-xs px-2 sm:px-4 h-8 sm:h-9 rounded-md sm:rounded-lg transition-all flex-1 sm:flex-initial min-w-0 ${
                viewMode === "analytics" 
                  ? "bg-autoofy-dark text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              📊
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      {viewMode === "table" && (
        <DashboardWidgets 
          testrides={testrides} 
          feedbackData={feedbackStats}
          monthTarget={monthlyTarget}
          onTargetChange={setMonthlyTarget}
        />
      )}

      {/* Quick Statistics - Only show in Calendar/Analytics mode */}
      {viewMode !== "table" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/25">
                  <Car className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">Totaal</span>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stats.total}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Proefritten</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-autoofy-red to-red-600 rounded-lg sm:rounded-xl shadow-lg shadow-red-500/25">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                {stats.monthGrowth !== 0 && (
                  <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                    stats.monthGrowth > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {stats.monthGrowth > 0 ? <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                    {Math.abs(stats.monthGrowth)}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stats.thisMonth}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Deze maand</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/25">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                {stats.today > 0 && (
                  <span className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stats.today}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Vandaag</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg sm:rounded-xl shadow-lg shadow-violet-500/25">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stats.completed}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Afgerond</p>
              </div>
            </CardContent>
          </Card>

          <Link href="/dashboard/feedback" className="block col-span-2 sm:col-span-1">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full cursor-pointer group">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg sm:rounded-xl shadow-lg shadow-amber-500/25">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {feedbackStats.hotLeads > 0 && (
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                      🔥 {feedbackStats.hotLeads}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{feedbackStats.total}</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 group-hover:text-amber-600 transition-colors">
                    Feedback <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* View Content */}
      {viewMode === "analytics" ? (
        <>
          <AnalyticsChart testrides={testrides} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Totaal proefritten</p>
                    <p className="text-2xl sm:text-3xl font-bold text-autoofy-dark">{stats.total}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-autoofy-dark shadow-lg">
                    <Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Deze maand</p>
                    <p className="text-2xl sm:text-3xl font-bold text-autoofy-dark">{stats.thisMonth}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-autoofy-red shadow-lg">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Deze week</p>
                    <p className="text-2xl sm:text-3xl font-bold text-autoofy-dark">{stats.thisWeek}</p>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-autoofy-dark shadow-lg">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : viewMode === "calendar" ? (
        <CalendarView testrides={testrides} />
      ) : (
        <>
          {/* Search and Filter */}
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />

          {/* Results count */}
          {searchQuery || dateFilter !== "all" ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in slide-in-from-left-4">
              <p className="text-sm text-muted-foreground">
                {filteredTestrides.length} van {testrides.length} proefritten
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setDateFilter("all")
                }}
                className="text-muted-foreground hover:text-autoofy-red transition-colors"
              >
                Filters wissen
              </Button>
            </div>
          ) : null}

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable 
              testrides={filteredTestrides} 
              onDelete={handleDelete}
              showEmptyState={!searchQuery && dateFilter === "all" && testrides.length === 0}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-2">
            {filteredTestrides.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Geen proefritten gevonden</p>
              </Card>
            ) : (
              filteredTestrides.map((testride) => (
                <MobileTestRideCard
                  key={testride.id}
                  testride={testride}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

