"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { SignaturePad } from "@/components/SignaturePad"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTestridePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [signature, setSignature] = useState("")

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    startTime: "",
    endTime: "",
    date: "",
    carType: "",
    licensePlate: "",
    startKm: "",
    endKm: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError("Datum en tijden zijn verplicht")
      setLoading(false)
      return
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`)
    
    if (endDateTime <= startDateTime) {
      setError("Eindtijd moet na starttijd zijn")
      setLoading(false)
      return
    }

    if (formData.endKm && parseInt(formData.endKm) < parseInt(formData.startKm)) {
      setError("Eindkilometerstand moet groter of gelijk zijn aan startkilometerstand")
      setLoading(false)
      return
    }

    try {
      const date = new Date(formData.date)

      const response = await fetch("/api/testrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          date: date.toISOString(),
          startKm: parseInt(formData.startKm),
          endKm: formData.endKm ? parseInt(formData.endKm) : undefined,
          signatureUrl: signature || undefined,
          customerPhone: formData.customerPhone || undefined,
          licensePlate: formData.licensePlate || undefined,
          notes: formData.notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        router.push("/dashboard?success=true")
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nieuwe Proefrit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Klantnaam *"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
              />
              <FormInput
                label="Klant e-mailadres *"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                required
              />
              <FormInput
                label="Klant telefoonnummer"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
              />
              <FormInput
                label="Adres *"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Autotype *"
                value={formData.carType}
                onChange={(e) =>
                  setFormData({ ...formData, carType: e.target.value })
                }
                required
              />
              <FormInput
                label="Kenteken"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Datum *"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
              <FormInput
                label="Starttijd *"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
              <FormInput
                label="Eindtijd *"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Startkilometerstand *"
                type="number"
                value={formData.startKm}
                onChange={(e) =>
                  setFormData({ ...formData, startKm: e.target.value })
                }
                required
                min="0"
              />
              <FormInput
                label="Eindkilometerstand"
                type="number"
                value={formData.endKm}
                onChange={(e) =>
                  setFormData({ ...formData, endKm: e.target.value })
                }
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notities</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <SignaturePad onSave={setSignature} />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-autoofy-dark text-white hover:bg-autoofy-dark/90"
              >
                {loading ? "Opslaan..." : "Opslaan"}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Annuleren
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

