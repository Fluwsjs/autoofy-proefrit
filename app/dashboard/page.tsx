"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/DataTable"
import { SearchAndFilter } from "@/components/SearchAndFilter"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, TrendingUp, Calendar, Car, Clock, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Link from "next/link"
import { SkeletonCard, SkeletonTable, SkeletonHeader } from "@/components/SkeletonLoader"
import { AnalyticsChart } from "@/components/AnalyticsChart"
import { CalendarView } from "@/components/CalendarView"
import { WelcomeWizard } from "@/components/WelcomeWizard"
import { FloatingActionButton } from "@/components/FloatingActionButton"
import { MobileTestRideCard } from "@/components/MobileTestRideCard"

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchTestrides()
      checkOnboardingStatus()
    }
  }, [session])
  
  // Re-check onboarding status when wizard is opened
  useEffect(() => {
    if (showWelcomeWizard && session) {
      checkOnboardingStatus()
    }
  }, [showWelcomeWizard])
  
  const checkOnboardingStatus = async () => {
    try {
      // Check if wizard has been shown before
      const wizardShown = localStorage.getItem('welcomeWizardShown')
      
      let isComplete = false
      
      // Check company info
      try {
        const companyResponse = await fetch("/api/company-info")
        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          isComplete = !!(companyData.companyName && companyData.companyAddress)
          setCompanyInfoComplete(isComplete)
        } else {
          // If 404 or error, company info is not complete
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
      const openWizard = searchParams.get("openWizard")
      const stepParam = searchParams.get("step")
      if (openWizard === "true") {
        setWizardStep(stepParam ? parseInt(stepParam) : 0)
        setShowWelcomeWizard(true)
        // Remove query param from URL
        router.replace("/dashboard")
        return
      }
      
      // Show wizard if not shown before OR if company info is not complete
      // This ensures new users always see the wizard
      if (!wizardShown || !isComplete) {
        setShowWelcomeWizard(true)
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
      // On error, show wizard for safety (better to show than not show)
      const wizardShown = localStorage.getItem('welcomeWizardShown')
      if (!wizardShown) {
        setShowWelcomeWizard(true)
      }
    }
  }
  
  const handleCloseWizard = () => {
    setShowWelcomeWizard(false)
    localStorage.setItem('welcomeWizardShown', 'true')
  }

  useEffect(() => {
    const success = searchParams.get("success")
    if (success === "true") {
      showToast("Proefrit succesvol aangemaakt!", "success")
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
    <div className="space-y-4 animate-in fade-in duration-300 pb-20 lg:pb-0">
      {ToastComponent}
      
      {/* Floating Action Button - Mobile Only */}
      <FloatingActionButton />
      
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
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 bg-gradient-to-r from-white via-blue-50/30 to-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-autoofy-dark to-gray-700 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-autoofy-dark">
                Welkom, {session?.user?.name?.split(' ')[0] || ""}
              </h1>
              <p className="text-gray-600 text-xs md:text-sm flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">Bedrijf: </span>{session?.user?.tenantName || ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 flex-1 sm:flex-initial">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`text-xs md:text-sm ${viewMode === "table" ? "bg-autoofy-dark text-white" : ""}`}
            >
              <span className="hidden md:inline">Tabel</span>
              <span className="md:hidden">📋</span>
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={`text-xs md:text-sm ${viewMode === "calendar" ? "bg-autoofy-dark text-white" : ""}`}
            >
              <span className="hidden md:inline">Kalender</span>
              <span className="md:hidden">📅</span>
            </Button>
            <Button
              variant={viewMode === "analytics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("analytics")}
              className={`text-xs md:text-sm ${viewMode === "analytics" ? "bg-autoofy-dark text-white" : ""}`}
            >
              <span className="hidden md:inline">Analytics</span>
              <span className="md:hidden">📊</span>
            </Button>
          </div>
          <Link href="/dashboard/new" className="hidden lg:block">
            <Button className="bg-autoofy-red text-white hover:bg-autoofy-red/90 shadow-lg transition-all duration-300 hover:scale-105 group">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nieuwe Proefrit
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards - Compact Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-blue-50 border-blue-100 hover:shadow-md transition-shadow duration-150">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Car className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600 mt-0.5">Totaal proefritten</p>
              <p className="text-xs text-slate-500 mt-1">Alle tijd</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-100 hover:shadow-md transition-shadow duration-150">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-red-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{stats.thisMonth}</p>
                {stats.monthGrowth !== 0 && (
                  <span className={`text-xs font-semibold ${
                    stats.monthGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.monthGrowth > 0 ? '+' : ''}{stats.monthGrowth}%
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-0.5">Deze maand</p>
              <p className="text-xs text-slate-500 mt-1">vs. vorige maand</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100 hover:shadow-md transition-shadow duration-150">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.today}</p>
              <p className="text-sm text-slate-600 mt-0.5">Vandaag</p>
              <p className="text-xs text-slate-500 mt-1">Gepland</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100 hover:shadow-md transition-shadow duration-150">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              <p className="text-sm text-slate-600 mt-0.5">Afgerond</p>
              <p className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% voltooid</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Today */}
      {stats.today > 0 && viewMode === "table" && (
        <Card className="bg-amber-50 border-amber-200 border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    {stats.today} proefrit{stats.today !== 1 ? 'ten' : ''} vandaag
                  </h3>
                  <p className="text-sm text-slate-600">
                    Vergeet niet om voor te bereiden
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setDateFilter("today")}
                size="sm"
                className="bg-autoofy-red hover:bg-autoofy-red/90 text-white h-9"
              >
                Bekijk vandaag
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Content */}
      {viewMode === "analytics" ? (
        <>
          <AnalyticsChart testrides={testrides} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Totaal proefritten</p>
                    <p className="text-3xl font-bold text-autoofy-dark">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Deze maand</p>
                    <p className="text-3xl font-bold text-autoofy-dark">{stats.thisMonth}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-autoofy-red shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Deze week</p>
                    <p className="text-3xl font-bold text-autoofy-dark">{stats.thisWeek}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
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

