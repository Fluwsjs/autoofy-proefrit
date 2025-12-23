"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { 
  Building2, 
  Users, 
  Car, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Key,
  Eye,
  EyeOff,
  Trash2,
  UserX,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Shield,
  BarChart3,
  X,
  Sparkles,
  ShieldOff,
  Unlock,
  Ban,
  Globe,
  Timer,
  Send,
  MailCheck
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import Image from "next/image"

interface User {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  isApproved: boolean
  isActive: boolean
  createdAt: string
}

interface Tenant {
  id: string
  name: string
  email: string
  createdAt: string
  userCount: number
  testrideCount: number
  users: User[]
  latestTestrides: Array<{
    id: string
    createdAt: string
  }>
}

interface AdminStats {
  overview: {
    totalTenants: number
    totalUsers: number
    totalTestrides: number
    recentTenants: number
    recentTestrides: number
  }
  tenants: Tenant[]
  monthlyStats: Record<string, number>
}

type TabType = "overzicht" | "bedrijven" | "gebruikers" | "beveiliging"

interface RateLimitEntry {
  key: string
  count: number
  resetAt: string
  remainingSeconds: number
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("overzicht")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set())
  
  // User management states
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Rate limit states
  const [rateLimitEntries, setRateLimitEntries] = useState<RateLimitEntry[]>([])
  const [rateLimitLoading, setRateLimitLoading] = useState(false)
  const [unblockingKey, setUnblockingKey] = useState<string | null>(null)
  const [manualUnblockIp, setManualUnblockIp] = useState("")
  
  // Resend verification states
  const [resendingVerificationId, setResendingVerificationId] = useState<string | null>(null)

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

  // Get all users from all tenants
  const getAllUsers = (): (User & { tenantName: string; tenantId: string })[] => {
    if (!stats) return []
    return stats.tenants.flatMap(tenant => 
      tenant.users.map(user => ({
        ...user,
        tenantName: tenant.name,
        tenantId: tenant.id
      }))
    )
  }

  // Count pending approvals
  const pendingApprovals = getAllUsers().filter(u => u.emailVerified && !u.isApproved).length

  // Filter tenants based on search
  const filteredTenants = stats?.tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.users.some(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || []

  // Filter users based on search
  const filteredUsers = getAllUsers().filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleTenantExpand = (tenantId: string) => {
    const newExpanded = new Set(expandedTenants)
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId)
    } else {
      newExpanded.add(tenantId)
    }
    setExpandedTenants(newExpanded)
  }

  // User management functions
  const handleApproveUser = async (userId: string) => {
    setApprovingUserId(userId)
    try {
      const response = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        await fetchStats()
        showToast("Gebruiker succesvol goedgekeurd", "success")
      } else {
        const data = await response.json()
        showToast(data.error || "Fout bij goedkeuren", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setApprovingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Weet je zeker dat je "${userName}" wilt verwijderen?`)) return

    setDeletingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (response.ok) {
        await fetchStats()
        showToast("Gebruiker verwijderd", "success")
      } else {
        showToast("Fout bij verwijderen", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactiveren" : "activeren"
    if (!confirm(`Gebruiker ${action}?`)) return

    setTogglingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        await fetchStats()
        showToast(`Gebruiker ${currentStatus ? "gedeactiveerd" : "geactiveerd"}`, "success")
      } else {
        showToast("Fout bij bijwerken", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setTogglingUserId(null)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 8) {
      showToast("Wachtwoord moet minimaal 8 tekens zijn", "error")
      return
    }

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      })

      if (response.ok) {
        setNewPassword("")
        setResettingUserId(null)
        showToast("Wachtwoord gereset", "success")
      } else {
        showToast("Fout bij resetten", "error")
      }
    } catch (err) {
      showToast("Er is een fout opgetreden", "error")
    }
  }

  // Rate limit functions
  const fetchRateLimits = async () => {
    setRateLimitLoading(true)
    try {
      const response = await fetch("/api/admin/rate-limit")
      if (response.ok) {
        const data = await response.json()
        setRateLimitEntries(data.entries || [])
      } else {
        showToast("Fout bij ophalen rate limits", "error")
      }
    } catch (error) {
      console.error("Error fetching rate limits:", error)
      showToast("Fout bij ophalen rate limits", "error")
    } finally {
      setRateLimitLoading(false)
    }
  }

  const handleUnblock = async (key: string) => {
    setUnblockingKey(key)
    try {
      // Determine if it's an IP or email based on the key format
      const isEmail = key.startsWith("email:")
      const body = isEmail 
        ? { email: key.replace("email:", "") }
        : { ip: key }

      const response = await fetch("/api/admin/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        showToast(data.message, "success")
        fetchRateLimits()
      } else {
        showToast("Fout bij deblokkeren", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setUnblockingKey(null)
    }
  }

  const handleManualUnblock = async () => {
    if (!manualUnblockIp.trim()) {
      showToast("Voer een IP-adres of email in", "error")
      return
    }

    const isEmail = manualUnblockIp.includes("@")
    const body = isEmail 
      ? { email: manualUnblockIp.trim() }
      : { ip: manualUnblockIp.trim() }

    try {
      const response = await fetch("/api/admin/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        showToast(data.message, "success")
        setManualUnblockIp("")
        fetchRateLimits()
      } else {
        showToast("Fout bij deblokkeren", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    }
  }

  const handleClearAllRateLimits = async () => {
    if (!confirm("Weet je zeker dat je ALLE rate limits wilt wissen? Dit kan de beveiliging tijdelijk verzwakken.")) {
      return
    }

    try {
      const response = await fetch("/api/admin/rate-limit", { method: "DELETE" })
      if (response.ok) {
        const data = await response.json()
        showToast(data.message, "success")
        fetchRateLimits()
      } else {
        showToast("Fout bij wissen", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    }
  }

  // Fetch rate limits when switching to beveiliging tab
  useEffect(() => {
    if (activeTab === "beveiliging") {
      fetchRateLimits()
    }
  }, [activeTab])

  // Resend verification email function
  const handleResendVerification = async (userId: string, userEmail: string) => {
    setResendingVerificationId(userId)
    try {
      const response = await fetch("/api/admin/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.alreadyVerified) {
          showToast(`${userEmail} is al geverifieerd`, "success")
        } else {
          showToast(`Verificatie e-mail verstuurd naar ${userEmail}`, "success")
        }
      } else {
        showToast(data.error || "Fout bij versturen", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setResendingVerificationId(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-4 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-autoofy-red/20 border-t-autoofy-red mx-auto"></div>
            <Shield className="h-6 w-6 text-autoofy-red absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400 font-medium">Admin Dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.isSuperAdmin || !stats) {
    return null
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overzicht", label: "Overzicht", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "bedrijven", label: "Bedrijven", icon: <Building2 className="h-4 w-4" />, count: stats.overview.totalTenants },
    { id: "gebruikers", label: "Gebruikers", icon: <Users className="h-4 w-4" />, count: stats.overview.totalUsers },
    { id: "beveiliging", label: "Beveiliging", icon: <ShieldOff className="h-4 w-4" />, count: rateLimitEntries.length > 0 ? rateLimitEntries.length : undefined },
  ]

  return (
    <div className="min-h-full">
      {ToastComponent}

      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-autoofy-dark/30 via-autoofy-red/5 to-autoofy-dark/30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-autoofy-dark/20 rounded-full blur-3xl hidden sm:block"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-autoofy-red/10 rounded-full blur-3xl hidden sm:block"></div>
        
        <div className="relative border-b border-white/10">
          <div className="container mx-auto px-4 py-5 sm:py-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Title Row */}
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-autoofy-dark to-autoofy-red rounded-xl sm:rounded-2xl blur-lg opacity-50"></div>
                    <div className="relative p-2 sm:p-3 bg-gradient-to-br from-autoofy-dark to-[#2a4a7a] rounded-xl sm:rounded-2xl shadow-xl border border-white/10">
                      <Shield className="h-5 w-5 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-base mt-0.5 sm:mt-1 hidden sm:block">Beheer alle bedrijven en gebruikers</p>
                  </div>
                </div>
                
                <Button
                  onClick={fetchStats}
                  size="sm"
                  className="gap-1.5 sm:gap-2 bg-autoofy-dark/50 border border-white/10 text-slate-300 hover:bg-autoofy-dark hover:text-white transition-all duration-300 h-9 px-3 sm:h-10 sm:px-4"
                >
                  <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Vernieuwen</span>
                </Button>
              </div>
              
              {/* Actions Row - Mobile */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Pending Approvals Badge */}
                {pendingApprovals > 0 && (
                  <button
                    onClick={() => setActiveTab("gebruikers")}
                    className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg sm:rounded-xl text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-300 text-sm"
                  >
                    <div className="relative">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                    </div>
                    <span className="font-semibold">{pendingApprovals} <span className="hidden sm:inline">wachtend</span></span>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs - horizontally scrollable on mobile */}
            <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-white text-autoofy-dark shadow-lg shadow-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-autoofy-red" : "text-slate-500 group-hover:text-slate-300"}>
                    {tab.icon}
                  </span>
                  <span className="text-sm sm:text-base">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${
                      activeTab === tab.id 
                        ? "bg-autoofy-red/10 text-autoofy-red" 
                        : "bg-slate-700/50 text-slate-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar (for bedrijven and gebruikers tabs) */}
      {activeTab !== "overzicht" && (
        <div className="border-b border-white/5 bg-autoofy-dark/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder={activeTab === "bedrijven" ? "Zoek bedrijf..." : "Zoek gebruiker..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-autoofy-dark/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-autoofy-red/50 focus:border-autoofy-red/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Overzicht Tab */}
        {activeTab === "overzicht" && (
          <div className="space-y-8">
            {/* Stats Cards - Clickable */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { label: "Bedrijven", value: stats.overview.totalTenants, icon: Building2, gradient: "from-autoofy-dark to-[#2a4a7a]", tab: "bedrijven" as TabType },
                { label: "Gebruikers", value: stats.overview.totalUsers, icon: Users, gradient: "from-autoofy-red to-[#d4384a]", tab: "gebruikers" as TabType },
                { label: "Proefritten", value: stats.overview.totalTestrides, icon: Car, gradient: "from-autoofy-dark to-[#2a4a7a]", tab: null },
                { label: "Nieuw (30d)", value: stats.overview.recentTenants, icon: TrendingUp, gradient: "from-emerald-600 to-teal-600", sublabel: "bedrijven", tab: "bedrijven" as TabType },
                { label: "Nieuw (30d)", value: stats.overview.recentTestrides, icon: Calendar, gradient: "from-autoofy-red to-[#d4384a]", sublabel: "proefritten", tab: null },
              ].map((stat, i) => (
                <button 
                  key={i}
                  onClick={() => stat.tab && setActiveTab(stat.tab)}
                  disabled={!stat.tab}
                  className={`group relative bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 transition-all duration-300 text-left w-full ${
                    i === 4 ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    stat.tab 
                      ? 'hover:border-autoofy-red/30 hover:-translate-y-1 hover:bg-autoofy-dark/60 cursor-pointer' 
                      : 'cursor-default'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-xs sm:text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl sm:text-4xl font-bold text-white mt-1 sm:mt-2">{stat.value}</p>
                      {stat.sublabel && (
                        <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">{stat.sublabel}</p>
                      )}
                    </div>
                    <div className={`p-2 sm:p-3 bg-gradient-to-br ${stat.gradient} rounded-lg sm:rounded-xl shadow-lg ${
                      stat.tab ? 'group-hover:scale-110 transition-transform' : ''
                    }`}>
                      <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  </div>
                  {stat.tab && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-autoofy-red/0 group-hover:ring-autoofy-red/30 transition-all pointer-events-none" />
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Tenants */}
              <div className="bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-autoofy-dark to-[#2a4a7a] rounded-lg">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    Nieuwste Bedrijven
                  </h3>
                  <button 
                    onClick={() => setActiveTab("bedrijven")}
                    className="text-sm text-autoofy-red hover:text-[#d4384a] font-medium transition-colors"
                  >
                    Bekijk alle
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {stats.tenants.slice(0, 5).map((tenant) => (
                    <div key={tenant.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-autoofy-dark to-[#2a4a7a] flex items-center justify-center text-white font-bold text-sm">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{tenant.name}</p>
                          <p className="text-sm text-slate-400">{tenant.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-300">{tenant.testrideCount} ritten</p>
                        <p className="text-xs text-slate-500">{formatDate(tenant.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    Wachtend op Goedkeuring
                    {pendingApprovals > 0 && (
                      <span className="bg-autoofy-red text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                        {pendingApprovals}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {pendingApprovals === 0 ? (
                    <div className="p-10 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                      </div>
                      <p className="text-slate-400 font-medium">Geen wachtende goedkeuringen</p>
                      <p className="text-sm text-slate-500 mt-1">Alle gebruikers zijn goedgekeurd</p>
                    </div>
                  ) : (
                    getAllUsers()
                      .filter(u => u.emailVerified && !u.isApproved)
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-autoofy-dark to-[#2a4a7a] flex items-center justify-center text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-sm text-slate-400">{user.tenantName}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(user.id)}
                            disabled={approvingUserId === user.id}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                          >
                            {approvingUserId === user.id ? "..." : "Goedkeuren"}
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bedrijven Tab */}
        {activeTab === "bedrijven" && (
          <div className="space-y-4">
            {filteredTenants.length === 0 ? (
              <div className="bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 font-medium text-lg">Geen bedrijven gevonden</p>
                <p className="text-slate-500 text-sm mt-1">Probeer een andere zoekopdracht</p>
              </div>
            ) : (
              filteredTenants.map(tenant => (
                <div key={tenant.id} className="bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-autoofy-red/30 transition-all duration-300">
                  {/* Tenant Header */}
                  <button
                    onClick={() => toggleTenantExpand(tenant.id)}
                    className="w-full p-3 sm:p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-autoofy-dark to-[#2a4a7a] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg shadow-autoofy-dark/50 border border-white/10 flex-shrink-0">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-semibold text-white text-sm sm:text-lg truncate">{tenant.name}</p>
                        <p className="text-xs sm:text-sm text-slate-400 truncate">{tenant.email}</p>
                        {/* Mobile stats */}
                        <div className="flex gap-3 mt-1 sm:hidden text-xs text-slate-500">
                          <span>{tenant.userCount} gebr.</span>
                          <span>{tenant.testrideCount} ritten</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
                      <div className="hidden sm:flex gap-4 sm:gap-6">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-white">{tenant.userCount}</p>
                          <p className="text-xs text-slate-500">gebruikers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-white">{tenant.testrideCount}</p>
                          <p className="text-xs text-slate-500">proefritten</p>
                        </div>
                      </div>
                      <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${expandedTenants.has(tenant.id) ? "bg-autoofy-red/20 text-autoofy-red" : "text-slate-400"}`}>
                        {expandedTenants.has(tenant.id) ? (
                          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Users */}
                  {expandedTenants.has(tenant.id) && (
                    <div className="border-t border-white/10 bg-[#0f1729]/50">
                      <div className="p-5">
                        <p className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Gebruikers ({tenant.users.length})
                        </p>
                        <div className="space-y-3">
                          {tenant.users.map(user => (
                            <div key={user.id} className="bg-autoofy-dark/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-autoofy-dark to-[#2a4a7a] flex items-center justify-center text-white font-medium border border-white/10">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-white">{user.name}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                                      {user.role}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-400">{user.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 flex-wrap">
                                {/* Status badges */}
                                <div className="flex gap-2">
                                  {user.emailVerified ? (
                                    <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      Geverifieerd
                                    </span>
                                  ) : (
                                    <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Niet geverifieerd
                                    </span>
                                  )}
                                  {!user.isApproved && user.emailVerified && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveUser(user.id)}
                                      disabled={approvingUserId === user.id}
                                      className="h-7 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                    >
                                      {approvingUserId === user.id ? "..." : "Goedkeuren"}
                                    </Button>
                                  )}
                                  {!user.isActive && (
                                    <span className="text-xs px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                                      Inactief
                                    </span>
                                  )}
                                </div>

                                {/* Actions */}
                                {resettingUserId === user.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nieuw wachtwoord"
                                        className="h-9 w-44 px-3 pr-9 bg-autoofy-dark border border-white/10 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-autoofy-red/50"
                                      />
                                      <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                      >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                    <Button size="sm" onClick={() => handleResetPassword(user.id)} className="h-9 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                                      Opslaan
                                    </Button>
                                    <button onClick={() => { setResettingUserId(null); setNewPassword("") }} className="p-2 text-slate-400 hover:text-white">
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setResettingUserId(user.id)}
                                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                      title="Wachtwoord resetten"
                                    >
                                      <Key className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleActive(user.id, user.isActive)}
                                      disabled={togglingUserId === user.id}
                                      className={`p-2 rounded-lg transition-colors ${user.isActive ? "text-amber-400 hover:bg-amber-500/20" : "text-emerald-400 hover:bg-emerald-500/20"}`}
                                      title={user.isActive ? "Deactiveren" : "Activeren"}
                                    >
                                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.id, user.name)}
                                      disabled={deletingUserId === user.id}
                                      className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
                                      title="Verwijderen"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Gebruikers Tab */}
        {activeTab === "gebruikers" && (
          <div className="space-y-6">
            {/* Pending approvals first */}
            {filteredUsers.filter(u => u.emailVerified && !u.isApproved).length > 0 && (
              <div className="bg-gradient-to-r from-autoofy-red/10 to-amber-500/10 backdrop-blur-sm border border-autoofy-red/30 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-autoofy-red/20">
                  <h3 className="font-semibold text-autoofy-red flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Wachtend op goedkeuring
                    <span className="bg-autoofy-red text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                      {filteredUsers.filter(u => u.emailVerified && !u.isApproved).length}
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-autoofy-red/10">
                  {filteredUsers.filter(u => u.emailVerified && !u.isApproved).map((user) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      onApprove={handleApproveUser}
                      onDelete={handleDeleteUser}
                      onToggleActive={handleToggleActive}
                      onResetPassword={handleResetPassword}
                      onResendVerification={handleResendVerification}
                      approvingUserId={approvingUserId}
                      deletingUserId={deletingUserId}
                      togglingUserId={togglingUserId}
                      resettingUserId={resettingUserId}
                      resendingVerificationId={resendingVerificationId}
                      setResettingUserId={setResettingUserId}
                      newPassword={newPassword}
                      setNewPassword={setNewPassword}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All other users */}
            <div className="bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-400" />
                  Alle gebruikers ({filteredUsers.length})
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {filteredUsers.filter(u => !u.emailVerified || u.isApproved).length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 font-medium text-lg">Geen gebruikers gevonden</p>
                    <p className="text-slate-500 text-sm mt-1">Probeer een andere zoekopdracht</p>
                  </div>
                ) : (
                  filteredUsers.filter(u => !u.emailVerified || u.isApproved).map((user) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      onApprove={handleApproveUser}
                      onDelete={handleDeleteUser}
                      onToggleActive={handleToggleActive}
                      onResetPassword={handleResetPassword}
                      onResendVerification={handleResendVerification}
                      approvingUserId={approvingUserId}
                      deletingUserId={deletingUserId}
                      togglingUserId={togglingUserId}
                      resettingUserId={resettingUserId}
                      resendingVerificationId={resendingVerificationId}
                      setResettingUserId={setResettingUserId}
                      newPassword={newPassword}
                      setNewPassword={setNewPassword}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Beveiliging Tab */}
        {activeTab === "beveiliging" && (
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-r from-autoofy-dark/60 to-[#1a2744]/60 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-autoofy-red to-[#d4384a] rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Rate Limiting Beveiliging</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Hier zie je IP-adressen en emails die tijdelijk geblokkeerd zijn vanwege te veel mislukte pogingen.
                    Je kunt ze handmatig deblokkeren als dat nodig is.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-autoofy-red"></div>
                      Login: 5 pogingen / 15 min
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      Registratie: 10 pogingen / 1 uur
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Wachtwoord reset: 3 pogingen / 1 uur
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Unblock */}
            <div className="bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Unlock className="h-5 w-5 text-emerald-400" />
                Handmatig Deblokkeren
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="IP-adres of email invoeren..."
                    value={manualUnblockIp}
                    onChange={(e) => setManualUnblockIp(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-autoofy-dark/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleManualUnblock()}
                  />
                </div>
                <Button
                  onClick={handleManualUnblock}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 px-6"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Deblokkeren
                </Button>
              </div>
            </div>

            {/* Blocked Entries List */}
            <div className="bg-autoofy-dark/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Ban className="h-5 w-5 text-autoofy-red" />
                  Geblokkeerde IP's & Emails
                  {rateLimitEntries.length > 0 && (
                    <span className="bg-autoofy-red text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                      {rateLimitEntries.length}
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchRateLimits}
                    size="sm"
                    disabled={rateLimitLoading}
                    className="gap-1.5 bg-autoofy-dark/50 border border-white/10 text-slate-300 hover:bg-autoofy-dark hover:text-white"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${rateLimitLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Vernieuwen</span>
                  </Button>
                  {rateLimitEntries.length > 0 && (
                    <Button
                      onClick={handleClearAllRateLimits}
                      size="sm"
                      className="gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Alles wissen</span>
                    </Button>
                  )}
                </div>
              </div>
              
              {rateLimitLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-autoofy-red/20 border-t-autoofy-red mx-auto"></div>
                  <p className="text-slate-400 mt-4">Laden...</p>
                </div>
              ) : rateLimitEntries.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-slate-400 font-medium text-lg">Geen geblokkeerde IP's of emails</p>
                  <p className="text-slate-500 text-sm mt-1">Alle gebruikers hebben vrije toegang</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {rateLimitEntries.map((entry) => {
                    const isEmail = entry.key.startsWith("email:")
                    const displayKey = isEmail ? entry.key.replace("email:", "") : entry.key
                    
                    return (
                      <div key={entry.key} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isEmail 
                              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
                              : 'bg-gradient-to-br from-autoofy-red/20 to-[#d4384a]/20 border border-autoofy-red/30'
                          }`}>
                            {isEmail ? (
                              <Mail className="h-5 w-5 text-amber-400" />
                            ) : (
                              <Globe className="h-5 w-5 text-autoofy-red" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white font-mono">{displayKey}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-400">
                                {isEmail ? 'Email' : 'IP-adres'}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-autoofy-red/20 text-autoofy-red border border-autoofy-red/30">
                                {entry.count} pogingen
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <Timer className="h-4 w-4" />
                              <span className="font-medium">{formatTimeRemaining(entry.remainingSeconds)}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">tot automatische deblokkering</p>
                          </div>
                          <Button
                            onClick={() => handleUnblock(entry.key)}
                            disabled={unblockingKey === entry.key}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                          >
                            {unblockingKey === entry.key ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Unlock className="h-4 w-4 mr-1.5" />
                                Deblokkeren
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to format remaining time
function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}u ${mins}m`
  }
}

// User Row Component
function UserRow({ 
  user, 
  onApprove,
  onDelete,
  onToggleActive,
  onResetPassword,
  onResendVerification,
  approvingUserId,
  deletingUserId,
  togglingUserId,
  resettingUserId,
  resendingVerificationId,
  setResettingUserId,
  newPassword,
  setNewPassword,
  showPassword,
  setShowPassword,
}: {
  user: User & { tenantName: string }
  onApprove: (id: string) => void
  onDelete: (id: string, name: string) => void
  onToggleActive: (id: string, current: boolean) => void
  onResetPassword: (id: string) => void
  onResendVerification: (id: string, email: string) => void
  approvingUserId: string | null
  deletingUserId: string | null
  togglingUserId: string | null
  resettingUserId: string | null
  resendingVerificationId: string | null
  setResettingUserId: (id: string | null) => void
  newPassword: string
  setNewPassword: (v: string) => void
  showPassword: boolean
  setShowPassword: (v: boolean) => void
}) {
  return (
    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-autoofy-dark to-[#2a4a7a] flex items-center justify-center text-white font-semibold text-lg border border-white/10">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white">{user.name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">{user.role}</span>
            {!user.isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Inactief</span>
            )}
          </div>
          <p className="text-sm text-slate-400">{user.email}</p>
          <p className="text-xs text-slate-500 mt-0.5">{user.tenantName}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status */}
        <div className="flex gap-2">
          {user.emailVerified ? (
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
              <MailCheck className="h-3 w-3" />
              Geverifieerd
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">Niet geverifieerd</span>
              <button
                onClick={() => onResendVerification(user.id, user.email)}
                disabled={resendingVerificationId === user.id}
                className="text-xs px-2.5 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                title="Verstuur verificatie e-mail opnieuw"
              >
                {resendingVerificationId === user.id ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">Verstuur email</span>
              </button>
            </div>
          )}
          {user.isApproved ? (
            <span className="text-xs px-3 py-1.5 rounded-full bg-autoofy-dark/50 text-slate-300 border border-white/20 font-medium">Goedgekeurd</span>
          ) : user.emailVerified ? (
            <Button
              size="sm"
              onClick={() => onApprove(user.id)}
              disabled={approvingUserId === user.id}
              className="h-7 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {approvingUserId === user.id ? "..." : "Goedkeuren"}
            </Button>
          ) : null}
        </div>

        {/* Actions */}
        {resettingUserId === user.id ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nieuw wachtwoord"
                className="h-9 w-44 px-3 pr-9 bg-autoofy-dark border border-white/10 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-autoofy-red/50"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button size="sm" onClick={() => onResetPassword(user.id)} className="h-9 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
              Opslaan
            </Button>
            <button onClick={() => { setResettingUserId(null); setNewPassword("") }} className="p-2 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => setResettingUserId(user.id)}
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Wachtwoord resetten"
            >
              <Key className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleActive(user.id, user.isActive)}
              disabled={togglingUserId === user.id}
              className={`p-2.5 rounded-lg transition-colors ${user.isActive ? "text-amber-400 hover:bg-amber-500/20" : "text-emerald-400 hover:bg-emerald-500/20"}`}
              title={user.isActive ? "Deactiveren" : "Activeren"}
            >
              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onDelete(user.id, user.name)}
              disabled={deletingUserId === user.id}
              className="p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              title="Verwijderen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
