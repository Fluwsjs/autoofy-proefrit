"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { DataTable } from "@/components/DataTable"
import { SearchAndFilter } from "@/components/SearchAndFilter"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, TrendingUp, Calendar, Car } from "lucide-react"
import Link from "next/link"
import { SkeletonCard, SkeletonTable, SkeletonHeader } from "@/components/SkeletonLoader"
import { AnalyticsChart } from "@/components/AnalyticsChart"
import { CalendarView } from "@/components/CalendarView"

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchTestrides()
    }
  }, [session])

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
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisWeek = new Date(now)
    thisWeek.setDate(thisWeek.getDate() - 7)

    return {
      total: testrides.length,
      thisMonth: testrides.filter(
        (t) => new Date(t.date) >= thisMonth
      ).length,
      thisWeek: testrides.filter((t) => new Date(t.date) >= thisWeek).length,
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
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-autoofy-dark">
            Welkom {session?.user?.name || ""}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Beheer uw proefritten
          </p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Totaal proefritten</p>
                <p className="text-3xl font-bold text-autoofy-dark transition-all group-hover:scale-110">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg group-hover:rotate-6 transition-transform duration-300">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Deze maand</p>
                <p className="text-3xl font-bold text-autoofy-dark transition-all group-hover:scale-110">{stats.thisMonth}</p>
              </div>
              <div className="p-3 rounded-xl bg-autoofy-red shadow-lg group-hover:rotate-6 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Deze week</p>
                <p className="text-3xl font-bold text-autoofy-dark transition-all group-hover:scale-110">{stats.thisWeek}</p>
              </div>
              <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg group-hover:rotate-6 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

