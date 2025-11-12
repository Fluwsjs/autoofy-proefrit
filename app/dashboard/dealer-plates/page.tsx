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
        const data = await response.json()
        setDealerPlates(data)
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
        setNewPlate("")
        setError("")
        showToast("Handelaarskenteken toegevoegd", "success")
        fetchDealerPlates()
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
      
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Handelaarskentekens Beheren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new plate form */}
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <FormInput
                  label="Nieuw handelaarskenteken"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="Bijv. 12-ABC-3"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={adding}
                  className="bg-autoofy-dark text-white hover:bg-autoofy-dark/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {adding ? "Toevoegen..." : "Toevoegen"}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </form>

          {/* List of plates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Mijn handelaarskentekens ({dealerPlates.length})
            </h3>
            {dealerPlates.length === 0 ? (
              <p className="text-muted-foreground">
                Nog geen handelaarskentekens toegevoegd. Voeg er een toe om te beginnen.
              </p>
            ) : (
              <div className="space-y-2">
                {dealerPlates.map((plate) => (
                  <div
                    key={plate.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{plate.plate}</p>
                      <p className="text-sm text-muted-foreground">
                        Toegevoegd op {new Date(plate.createdAt).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plate.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
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

