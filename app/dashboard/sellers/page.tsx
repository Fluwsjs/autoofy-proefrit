"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { ArrowLeft, Plus, Trash2, User, Mail, Phone } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface Seller {
  id: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  _count?: {
    testrides: number
  }
}

export default function SellersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/dashboard"
  const { data: session } = useSession()
  const { showToast, ToastComponent } = useToast()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (session) {
      fetchSellers()
    }
  }, [session])

  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/sellers")
      if (response.ok) {
        const result = await response.json()
        const sellers = result.data || result
        setSellers(sellers)
      }
    } catch (error) {
      console.error("Error fetching sellers:", error)
      showToast("Fout bij ophalen verkopers", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!formData.name.trim()) {
      setError("Naam is verplicht")
      return
    }

    setAdding(true)
    try {
      const response = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        showToast("Verkoper toegevoegd", "success")
        setFormData({ name: "", email: "", phone: "" })
        setShowForm(false)
        setError("")
        await fetchSellers()
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Weet u zeker dat u deze verkoper wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/sellers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSellers(sellers.filter((s) => s.id !== id))
        showToast("Verkoper verwijderd", "success")
      } else {
        showToast("Fout bij verwijderen verkoper", "error")
      }
    } catch (error) {
      console.error("Error deleting seller:", error)
      showToast("Fout bij verwijderen verkoper", "error")
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
      {ToastComponent}
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => router.push(returnTo)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {returnTo === "/dashboard/new" ? "Terug naar formulier" : "Terug naar dashboard"}
      </Button>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-autoofy-dark to-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Verkopers Beheren
            </CardTitle>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe verkoper
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Add new seller form */}
          {showForm && (
            <form onSubmit={handleAdd} className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-autoofy-dark">Nieuwe verkoper toevoegen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Naam *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Volledige naam"
                  disabled={adding}
                />
                <FormInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="verkoper@bedrijf.nl"
                  disabled={adding}
                />
                <FormInput
                  label="Telefoon"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="06-12345678"
                  disabled={adding}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={adding}
                  className="bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white"
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ name: "", email: "", phone: "" })
                    setError("")
                  }}
                >
                  Annuleren
                </Button>
              </div>
            </form>
          )}

          {/* List of sellers */}
          <div className={showForm ? "border-t pt-6" : ""}>
            <h3 className="text-lg font-semibold mb-4 text-autoofy-dark">
              Mijn verkopers ({sellers.length})
            </h3>
            {sellers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  Nog geen verkopers toegevoegd. Voeg er een toe om te beginnen.
                </p>
                {!showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="mt-4 bg-autoofy-red hover:bg-autoofy-red/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste verkoper toevoegen
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sellers.map((seller, index) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-autoofy-dark to-gray-700 flex items-center justify-center text-white font-bold text-lg">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-autoofy-dark">{seller.name}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          {seller.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {seller.email}
                            </span>
                          )}
                          {seller.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {seller.phone}
                            </span>
                          )}
                          {seller._count && (
                            <span className="text-autoofy-red font-medium">
                              {seller._count.testrides} proefrit{seller._count.testrides !== 1 ? 'ten' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(seller.id)}
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

