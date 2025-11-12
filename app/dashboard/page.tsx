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
        const data = await response.json()
        setTestrides(data)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ToastComponent}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-autoofy-dark">
            Welkom {session?.user?.name || ""}
          </h1>
          <p className="text-muted-foreground">
            Beheer uw proefritten
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="bg-autoofy-dark text-white hover:bg-autoofy-dark/90 shadow-lg transition-all duration-300 hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Proefrit
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Totaal proefritten</p>
                <p className="text-3xl font-bold text-autoofy-dark">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Deze maand</p>
                <p className="text-3xl font-bold text-autoofy-dark">{stats.thisMonth}</p>
              </div>
              <div className="p-3 rounded-xl bg-autoofy-light shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Deze week</p>
                <p className="text-3xl font-bold text-autoofy-dark">{stats.thisWeek}</p>
              </div>
              <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {/* Results count */}
      {searchQuery || dateFilter !== "all" ? (
        <p className="text-sm text-muted-foreground">
          {filteredTestrides.length} van {testrides.length} proefritten
        </p>
      ) : null}

      <DataTable testrides={filteredTestrides} onDelete={handleDelete} />
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

