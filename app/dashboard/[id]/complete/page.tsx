"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TermsAndConditions } from "@/components/TermsAndConditions"
import { SellerSignature } from "@/components/SellerSignature"
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
    if (!completionSignature) {
      showToast("Teken een handtekening om af te ronden", "error")
      return
    }

    if (!confirm("Weet u zeker dat u deze proefrit wilt afronden?")) {
      return
    }

    setCompleting(true)
    try {
      const response = await fetch(`/api/testrides/${testride?.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionSignatureUrl: completionSignature,
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
                <p className="text-muted-foreground">Datum:</p>
                <p className="font-medium">{formatDate(testride.date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tijd:</p>
                <p className="font-medium">
                  {formatDateTime(testride.startTime)} - {formatDateTime(testride.endTime)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Kilometerstand:</p>
                <p className="font-medium">
                  {testride.startKm} km
                  {testride.endKm !== null && ` → ${testride.endKm} km`}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4 text-lg">Handtekening voor Afronding</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Teken hieronder uw handtekening om de proefrit officieel af te ronden.
            </p>
            <SellerSignature onUse={setCompletionSignature} />
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={handleComplete}
              disabled={completing || !completionSignature}
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
                  Proefrit Afronden
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

