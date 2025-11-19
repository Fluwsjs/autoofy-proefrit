"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"

interface DealerPlate {
  id: string
  plate: string
  createdAt: string
}

export default function DealerPlatesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { showToast, ToastComponent } = useToast()
  const [dealerPlates, setDealerPlates] = useState<DealerPlate[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newPlate, setNewPlate] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (session) {
      fetchDealerPlates()
    }
  }, [session])

  const fetchDealerPlates = async () => {
    try {
      const response = await fetch("/api/dealer-plates")
      if (response.ok) {
        const result = await response.json()
        // Handle paginated response: { data: [...], pagination: {...} }
        const dealerPlates = result.data || result
        setDealerPlates(dealerPlates)
      }
    } catch (error) {
      console.error("Error fetching dealer plates:", error)
      showToast("Fout bij ophalen handelaarskentekens", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!newPlate.trim()) {
      setError("Handelaarskenteken is verplicht")
      return
    }

    setAdding(true)
    try {
      const response = await fetch("/api/dealer-plates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: newPlate.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        showToast("Handelaarskenteken toegevoegd", "success")
        setNewPlate("")
        setError("")
        await fetchDealerPlates()
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Weet u zeker dat u dit handelaarskenteken wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/dealer-plates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDealerPlates(dealerPlates.filter((p) => p.id !== id))
        showToast("Handelaarskenteken verwijderd", "success")
      } else {
        showToast("Fout bij verwijderen handelaarskenteken", "error")
      }
    } catch (error) {
      console.error("Error deleting dealer plate:", error)
      showToast("Fout bij verwijderen handelaarskenteken", "error")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Laden...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {ToastComponent}
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Terug naar dashboard
      </Button>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-autoofy-dark to-gray-800 border-b border-gray-700">
          <CardTitle className="text-xl font-bold text-white">Handelaarskentekens Beheren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Add new plate form */}
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <FormInput
                  label="Nieuw handelaarskenteken"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="Bijv. 12-ABC-3"
                  disabled={adding}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={adding}
                  className="w-full sm:w-auto bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {adding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Toevoegen...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Toevoegen
                    </>
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-in slide-in-from-left-4">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}
          </form>

          {/* List of plates */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-autoofy-dark">
              Mijn handelaarskentekens ({dealerPlates.length})
            </h3>
            {dealerPlates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-600">
                  Nog geen handelaarskentekens toegevoegd. Voeg er een toe om te beginnen.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dealerPlates.map((plate, index) => (
                  <div
                    key={plate.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-semibold text-lg text-autoofy-dark">{plate.plate}</p>
                      <p className="text-sm text-gray-600">
                        Toegevoegd op {new Date(plate.createdAt).toLocaleDateString("nl-NL", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plate.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

