"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { 
  Building2, 
  Users, 
  Car, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  RefreshCw,
  Key
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AdminStats {
  overview: {
    totalTenants: number
    totalUsers: number
    totalTestrides: number
    recentTenants: number
    recentTestrides: number
  }
  tenants: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    userCount: number
    testrideCount: number
    users: Array<{
      id: string
      name: string
      email: string
      role: string
      createdAt: string
    }>
    latestTestrides: Array<{
      id: string
      createdAt: string
    }>
  }>
  monthlyStats: Record<string, number>
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated" && !session?.user?.isSuperAdmin) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isSuperAdmin) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        if (response.status === 401 || response.status === 403) {
          router.push("/dashboard")
        } else {
          showToast("Fout bij ophalen statistieken", "error")
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      showToast("Fout bij ophalen statistieken", "error")
    } finally {
      setLoading(false)
    }
  }

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

  if (!session?.user?.isSuperAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {ToastComponent}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-autoofy-dark">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Overzicht van alle tenants en activiteit
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/users">
              <Button variant="outline" className="gap-2">
                <Key className="h-4 w-4" />
                Gebruikersbeheer
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={fetchStats}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Vernieuwen
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Terug
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Totaal Bedrijven</p>
                      <p className="text-3xl font-bold text-autoofy-dark">
                        {stats.overview.totalTenants}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Totaal Gebruikers</p>
                      <p className="text-3xl font-bold text-autoofy-dark">
                        {stats.overview.totalUsers}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-autoofy-light shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Totaal Proefritten</p>
                      <p className="text-3xl font-bold text-autoofy-dark">
                        {stats.overview.totalTestrides}
                      </p>
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
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nieuwe Bedrijven</p>
                      <p className="text-3xl font-bold text-autoofy-dark">
                        {stats.overview.recentTenants}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Laatste 30 dagen</p>
                    </div>
                    <div className="p-3 rounded-xl bg-autoofy-light shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nieuwe Proefritten</p>
                      <p className="text-3xl font-bold text-autoofy-dark">
                        {stats.overview.recentTestrides}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Laatste 30 dagen</p>
                    </div>
                    <div className="p-3 rounded-xl bg-autoofy-dark shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tenants List */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-autoofy-dark border-b">
                <CardTitle className="text-xl font-bold text-white">
                  Alle Bedrijven ({stats.tenants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sm">Bedrijf</th>
                        <th className="text-left p-4 font-semibold text-sm">E-mail</th>
                        <th className="text-left p-4 font-semibold text-sm">Gebruikers</th>
                        <th className="text-left p-4 font-semibold text-sm">Proefritten</th>
                        <th className="text-left p-4 font-semibold text-sm">Geregistreerd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.tenants.map((tenant) => (
                        <tr
                          key={tenant.id}
                          className="border-b hover:bg-blue-50/50 transition-all"
                        >
                          <td className="p-4">
                            <div className="font-semibold">{tenant.name}</div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {tenant.email}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-autoofy-light/20 text-autoofy-dark border border-autoofy-light/30">
                              {tenant.userCount} gebruiker{tenant.userCount !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-autoofy-light/20 text-autoofy-dark border border-autoofy-light/30">
                              {tenant.testrideCount} proefrit{tenant.testrideCount !== 1 ? "ten" : ""}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {formatDate(tenant.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

