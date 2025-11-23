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
    <div className="space-y-6 animate-in fade-in duration-500">
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
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-blue-50/30 to-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-autoofy-dark to-gray-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-autoofy-dark">
                Welkom terug, {session?.user?.name?.split(' ')[0] || ""}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Bedrijf: {session?.user?.tenantName || ""}
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
              className={viewMode === "table" ? "bg-autoofy-dark text-white" : ""}
            >
              <span className="hidden sm:inline">Tabel</span>
              <span className="sm:hidden">📋</span>
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={viewMode === "calendar" ? "bg-autoofy-dark text-white" : ""}
            >
              <span className="hidden sm:inline">Kalender</span>
              <span className="sm:hidden">📅</span>
            </Button>
            <Button
              variant={viewMode === "analytics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("analytics")}
              className={viewMode === "analytics" ? "bg-autoofy-dark text-white" : ""}
            >
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">📊</span>
            </Button>
          </div>
          <Link href="/dashboard/new" className="flex-1 sm:flex-initial">
            <Button className="bg-autoofy-red text-white hover:bg-autoofy-red/90 shadow-lg transition-all duration-300 hover:scale-105 group w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Nieuwe Proefrit</span>
              <span className="sm:hidden">Nieuw</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-blue-50/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-autoofy-dark/5 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Totaal proefritten</p>
                <p className="text-4xl font-bold text-autoofy-dark transition-all group-hover:scale-110">{stats.total}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Car className="h-3 w-3" />
                  <span>Alle tijd</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-autoofy-dark to-gray-800 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 via-white to-red-50/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-autoofy-red/5 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Deze maand</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-autoofy-dark transition-all group-hover:scale-110">{stats.thisMonth}</p>
                  {stats.monthGrowth !== 0 && (
                    <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                      stats.monthGrowth > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stats.monthGrowth > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(stats.monthGrowth)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>vs. vorige maand</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-autoofy-red to-red-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-white to-green-50/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Vandaag</p>
                <p className="text-4xl font-bold text-autoofy-dark transition-all group-hover:scale-110">{stats.today}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Gepland</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-purple-50/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Afgerond</p>
                <p className="text-4xl font-bold text-autoofy-dark transition-all group-hover:scale-110">{stats.completed}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CheckCircle className="h-3 w-3" />
                  <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% voltooid</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Today */}
      {stats.today > 0 && viewMode === "table" && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-l-4 border-amber-400">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-400 shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-autoofy-dark text-lg">
                    {stats.today} proefrit{stats.today !== 1 ? 'ten' : ''} vandaag
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vergeet niet om voor te bereiden en te controleren
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setDateFilter("today")}
                className="bg-autoofy-dark hover:bg-autoofy-dark/90 text-white"
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

          <DataTable 
            testrides={filteredTestrides} 
            onDelete={handleDelete}
            showEmptyState={!searchQuery && dateFilter === "all" && testrides.length === 0}
          />
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

