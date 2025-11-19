"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { useToast } from "@/components/ui/toast"
import { ArrowLeft, Key, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  tenant: {
    id: string
    name: string
  }
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated" && !session?.user?.isSuperAdmin) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isSuperAdmin) {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const result = await response.json()
        // Handle paginated response: { data: [...], pagination: {...} }
        const users = result.data || result
        setUsers(users)
      } else {
        showToast("Fout bij ophalen gebruikers", "error")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      showToast("Fout bij ophalen gebruikers", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId: string) => {
    setApprovingUserId(userId)
    try {
      const response = await fetch("/api/admin/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        // Update local state
        setUsers(users.map(u => 
          u.id === userId ? { ...u, emailVerified: true } : u
        ))
        showToast("Gebruiker succesvol goedgekeurd", "success")
      } else {
        showToast("Fout bij goedkeuren gebruiker", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setApprovingUserId(null)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens lang zijn")
      return
    }

    setError("")
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fout bij resetten wachtwoord")
      } else {
        setNewPassword("")
        setResettingUserId(null)
        setError("")
        showToast("Wachtwoord succesvol gereset", "success")
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-autoofy-dark">
              Gebruikersbeheer
            </h1>
            <p className="text-muted-foreground mt-2">
              Beheer alle gebruikers en reset wachtwoorden
            </p>
          </div>
          <Link href="/admin">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Terug naar Admin Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-autoofy-dark border-b">
            <CardTitle className="text-xl font-bold text-white">
              Alle Gebruikers ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Naam</th>
                    <th className="text-left p-4 font-semibold text-sm">E-mail</th>
                    <th className="text-left p-4 font-semibold text-sm">Bedrijf</th>
                    <th className="text-left p-4 font-semibold text-sm">Rol</th>
                    <th className="text-left p-4 font-semibold text-sm">Status</th>
                    <th className="text-left p-4 font-semibold text-sm">Geregistreerd</th>
                    <th className="text-left p-4 font-semibold text-sm">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-blue-50/50 transition-all"
                    >
                      <td className="p-4">
                        <div className="font-semibold">{user.name}</div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{user.tenant.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-autoofy-red/20 text-autoofy-dark border border-autoofy-red/30">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Geverifieerd
                          </span>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800"
                            onClick={() => handleApproveUser(user.id)}
                            disabled={approvingUserId === user.id}
                          >
                            {approvingUserId === user.id ? "Bezig..." : "Goedkeuren"}
                          </Button>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        {resettingUserId === user.id ? (
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Nieuw wachtwoord"
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleResetPassword(user.id)}
                              className="bg-autoofy-dark text-white hover:bg-autoofy-dark/90"
                            >
                              Opslaan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setResettingUserId(null)
                                setNewPassword("")
                                setError("")
                              }}
                            >
                              Annuleren
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResettingUserId(user.id)}
                            className="gap-2"
                          >
                            <Key className="h-4 w-4" />
                            Reset Wachtwoord
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {error && (
              <div className="p-4 border-t">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

