"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TermsAndConditions } from "@/components/TermsAndConditions"
import { SellerSignature } from "@/components/SellerSignature"
import { CustomerSignature } from "@/components/CustomerSignature"
import { FormInput } from "@/components/FormInput"
import { Label } from "@/components/ui/label"
import { formatDate, formatDateTime } from "@/lib/utils"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"

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

export default function CompleteTestridePage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const { showToast, ToastComponent } = useToast()
  const [testride, setTestride] = useState<Testride | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completionSignature, setCompletionSignature] = useState("")
  const [customerCompletionSignature, setCustomerCompletionSignature] = useState("")
  
  // Afrondingsgegevens
  const [completionData, setCompletionData] = useState({
    actualEndDate: "",
    actualEndTime: "",
    actualEndKm: "",
    noDamages: false,
    noFines: false,
    allKeysReturned: false,
    completionNotes: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchTestride(params.id as string)
    }
  }, [params.id])

  const fetchTestride = async (id: string) => {
    try {
      const response = await fetch(`/api/testrides/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTestride(data)
        if (data.status === "COMPLETED") {
          showToast("Deze proefrit is al afgerond", "info")
          router.push(`/dashboard/${id}`)
        }
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching testride:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    // Validatie
    if (!completionData.actualEndDate || !completionData.actualEndTime) {
      showToast("Vul de exacte einddatum en eindtijd in", "error")
      return
    }
    
    if (!completionData.actualEndKm) {
      showToast("Vul de exacte eindkilometerstand in", "error")
      return
    }
    
    if (!completionData.noDamages || !completionData.noFines || !completionData.allKeysReturned) {
      showToast("Vink alle controle items aan", "error")
      return
    }
    
    if (!completionSignature) {
      showToast("Bedrijfshandtekening is verplicht", "error")
      return
    }
    
    if (!customerCompletionSignature) {
      showToast("Klanthandtekening is verplicht", "error")
      return
    }

    if (!confirm("Weet u zeker dat u deze proefrit wilt afronden?")) {
      return
    }

    setCompleting(true)
    try {
      const actualEndDateTime = new Date(`${completionData.actualEndDate}T${completionData.actualEndTime}`)
      
      const response = await fetch(`/api/testrides/${testride?.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionSignatureUrl: completionSignature,
          customerCompletionSignatureUrl: customerCompletionSignature,
          actualEndTime: actualEndDateTime.toISOString(),
          actualEndKm: parseInt(completionData.actualEndKm),
          completionNotes: completionData.completionNotes || undefined,
        }),
      })

      if (response.ok) {
        showToast("Proefrit succesvol afgerond!", "success")
        router.push(`/dashboard/${testride?.id}`)
      } else {
        const data = await response.json()
        showToast(data.error || "Fout bij afronden proefrit", "error")
      }
    } catch (error) {
      console.error("Error completing testride:", error)
      showToast("Fout bij afronden proefrit", "error")
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Laden...</p>
      </div>
    )
  }

  if (!testride) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {ToastComponent}
      <Link href={`/dashboard/${testride.id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar details
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-autoofy-dark" />
            Proefrit Afronden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Proefrit Overzicht */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-autoofy-dark mb-2">Proefrit Overzicht</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Klant:</p>
                <p className="font-medium">{testride.customerName}</p>
                <p className="text-muted-foreground text-xs">{testride.customerEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Auto:</p>
                <p className="font-medium">{testride.carType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start datum:</p>
                <p className="font-medium">{formatDate(testride.date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start tijd:</p>
                <p className="font-medium">{formatDateTime(testride.startTime)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start kilometerstand:</p>
                <p className="font-medium">{testride.startKm} km</p>
              </div>
            </div>
          </div>

          {/* Afrondingsgegevens */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 text-lg text-autoofy-dark">Afrondingsgegevens</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Exacte einddatum *"
                type="date"
                value={completionData.actualEndDate}
                onChange={(e) =>
                  setCompletionData({ ...completionData, actualEndDate: e.target.value })
                }
                required
              />
              <FormInput
                label="Exacte eindtijd *"
                type="time"
                value={completionData.actualEndTime}
                onChange={(e) =>
                  setCompletionData({ ...completionData, actualEndTime: e.target.value })
                }
                required
              />
              <FormInput
                label="Exacte eindkilometerstand *"
                type="number"
                value={completionData.actualEndKm}
                onChange={(e) =>
                  setCompletionData({ ...completionData, actualEndKm: e.target.value })
                }
                required
                min={testride.startKm}
              />
            </div>
          </div>

          {/* Controle Checklist */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 text-lg text-autoofy-dark">Controle Checklist</h3>
            <div className="space-y-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completionData.noDamages}
                  onChange={(e) =>
                    setCompletionData({ ...completionData, noDamages: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium">Geen schades geconstateerd</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completionData.noFines}
                  onChange={(e) =>
                    setCompletionData({ ...completionData, noFines: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium">Geen bekeuringen ontvangen</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completionData.allKeysReturned}
                  onChange={(e) =>
                    setCompletionData({ ...completionData, allKeysReturned: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium">Alle sleutels zijn ingeleverd</span>
              </label>
            </div>
          </div>

          {/* Extra notities */}
          <div className="border-t pt-6">
            <Label htmlFor="completionNotes">Extra notities bij afronding</Label>
            <textarea
              id="completionNotes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
              value={completionData.completionNotes}
              onChange={(e) =>
                setCompletionData({ ...completionData, completionNotes: e.target.value })
              }
              placeholder="Eventuele opmerkingen bij het afronden van de proefrit..."
              rows={4}
            />
          </div>

          {/* Handtekeningen */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 text-lg text-autoofy-dark">Handtekeningen</h3>
            
            <div className="space-y-6">
              <div>
                <SellerSignature onUse={setCompletionSignature} hideReuse={true} />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Klant bevestigt dat het voertuig in goede staat is teruggebracht
                </p>
              </div>
              
              <div>
                <CustomerSignature onSave={setCustomerCompletionSignature} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={handleComplete}
              disabled={completing || !completionSignature || !customerCompletionSignature || !completionData.noDamages || !completionData.noFines || !completionData.allKeysReturned}
              className="bg-autoofy-red text-white hover:bg-autoofy-red/90 flex-1"
            >
              {completing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Afronden...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Proefrit Definitief Afronden
                </>
              )}
            </Button>
            <Link href={`/dashboard/${testride.id}`}>
              <Button type="button" variant="outline">
                Annuleren
              </Button>
            </Link>
          </div>

          {/* Voorwaarden */}
          <div className="pt-6 border-t mt-6">
            <TermsAndConditions />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

