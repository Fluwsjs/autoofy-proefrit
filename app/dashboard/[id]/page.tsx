"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime } from "@/lib/utils"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Testride {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  address: string
  startTime: string
  endTime: string
  date: string
  carType: string
  licensePlate: string | null
  driverLicenseNumber: string | null
  dealerPlate: {
    id: string
    plate: string
  } | null
  idPhotoUrl: string | null
  startKm: number
  endKm: number | null
  signatureUrl: string | null
  notes: string | null
  createdAt: string
}

export default function TestrideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [testride, setTestride] = useState<Testride | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async () => {
    if (!confirm("Weet u zeker dat u deze proefrit wilt verwijderen?")) {
      return
    }

    try {
      const response = await fetch(`/api/testrides/${testride?.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        alert("Fout bij verwijderen proefrit")
      }
    } catch (error) {
      console.error("Error deleting testride:", error)
      alert("Fout bij verwijderen proefrit")
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
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Proefrit Details</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijderen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Klantgegevens</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Naam:</span>{" "}
                  {testride.customerName}
                </p>
                <p>
                  <span className="text-muted-foreground">E-mail:</span>{" "}
                  {testride.customerEmail}
                </p>
                {testride.customerPhone && (
                  <p>
                    <span className="text-muted-foreground">Telefoon:</span>{" "}
                    {testride.customerPhone}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Adres:</span>{" "}
                  {testride.address}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Autogegevens</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {testride.carType}
                </p>
                {testride.licensePlate && (
                  <p>
                    <span className="text-muted-foreground">Kenteken voertuig, meldcode of chassisnummer:</span>{" "}
                    {testride.licensePlate}
                  </p>
                )}
                {testride.dealerPlate && (
                  <p>
                    <span className="text-muted-foreground">Handelaarskenteken:</span>{" "}
                    {testride.dealerPlate.plate}
                  </p>
                )}
                {testride.driverLicenseNumber && (
                  <p>
                    <span className="text-muted-foreground">Rijbewijs nummer:</span>{" "}
                    {testride.driverLicenseNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Ritgegevens</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Datum:</span>{" "}
                  {formatDate(testride.date)}
                </p>
                <p>
                  <span className="text-muted-foreground">Starttijd:</span>{" "}
                  {formatDateTime(testride.startTime)}
                </p>
                <p>
                  <span className="text-muted-foreground">Eindtijd:</span>{" "}
                  {formatDateTime(testride.endTime)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Kilometerstand</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Start:</span>{" "}
                  {testride.startKm} km
                </p>
                {testride.endKm !== null && (
                  <p>
                    <span className="text-muted-foreground">Eind:</span>{" "}
                    {testride.endKm} km
                  </p>
                )}
                {testride.endKm !== null && (
                  <p>
                    <span className="text-muted-foreground">Afstand:</span>{" "}
                    {testride.endKm - testride.startKm} km
                  </p>
                )}
              </div>
            </div>
          </div>

          {testride.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notities</h3>
              <p className="text-sm">{testride.notes}</p>
            </div>
          )}

          {testride.idPhotoUrl && (
            <div>
              <h3 className="font-semibold mb-2">ID Foto</h3>
              <div className="border rounded-md p-4 bg-white">
                <Image
                  src={testride.idPhotoUrl}
                  alt="ID Foto"
                  width={500}
                  height={300}
                  className="max-w-full h-auto object-contain rounded"
                  unoptimized
                />
              </div>
            </div>
          )}

          {testride.signatureUrl && (
            <div>
              <h3 className="font-semibold mb-2">Handtekening</h3>
              <div className="border rounded-md p-4 bg-white">
                <img
                  src={testride.signatureUrl}
                  alt="Handtekening"
                  className="max-w-full h-32 object-contain"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground">
            Aangemaakt op: {formatDateTime(testride.createdAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

