"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime } from "@/lib/utils"
import { ArrowLeft, Trash2, Download, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { exportTestrideToPDF } from "@/lib/pdf-export"
import { TermsAndConditions } from "@/components/TermsAndConditions"

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
  idCountryOfOrigin: string | null
  dealerPlate: {
    id: string
    plate: string
  } | null
  idPhotoFrontUrl: string | null
  idPhotoBackUrl: string | null
  customerSignatureUrl: string | null
  sellerSignatureUrl: string | null
  completionSignatureUrl: string | null
  eigenRisico: number
  aantalSleutels: number
  status: string
  completedAt: string | null
  startKm: number
  endKm: number | null
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

  const handleExportPDF = async () => {
    if (!testride) return
    
    try {
      // Transform testride to TestrideData format
      const testrideData = {
        customerName: testride.customerName,
        customerEmail: testride.customerEmail,
        customerPhone: testride.customerPhone,
        address: testride.address,
        startTime: testride.startTime,
        endTime: testride.endTime,
        date: testride.date,
        carType: testride.carType,
        licensePlate: testride.licensePlate,
        driverLicenseNumber: testride.driverLicenseNumber,
        idCountryOfOrigin: testride.idCountryOfOrigin,
        dealerPlate: testride.dealerPlate ? { plate: testride.dealerPlate.plate } : null,
        idPhotoFrontUrl: testride.idPhotoFrontUrl,
        idPhotoBackUrl: testride.idPhotoBackUrl,
        customerSignatureUrl: testride.customerSignatureUrl,
        sellerSignatureUrl: testride.sellerSignatureUrl,
        completionSignatureUrl: testride.completionSignatureUrl,
        eigenRisico: testride.eigenRisico,
        aantalSleutels: testride.aantalSleutels,
        status: testride.status,
        completedAt: testride.completedAt,
        startKm: testride.startKm,
        endKm: testride.endKm,
        notes: testride.notes,
        createdAt: testride.createdAt,
      }
      
      await exportTestrideToPDF(testrideData)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Fout bij exporteren naar PDF")
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Image
                src="/autoofy-logo.svg"
                alt="Autoofy Logo"
                width={152}
                height={17}
                className="object-contain h-8 w-auto"
                priority
              />
              <CardTitle className="mb-0">Proefrit Details</CardTitle>
            </div>
            <div className="flex gap-2">
              {testride.status !== "COMPLETED" && (
                <Link href={`/dashboard/${testride.id}/complete`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Afronden
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="bg-autoofy-dark text-white hover:bg-autoofy-dark/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Export naar PDF
              </Button>
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
              <h3 className="font-semibold mb-2">Voertuiggegevens</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Testrit voertuig:</span>{" "}
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
                           <span className="text-muted-foreground">Rijbewijs of BSN nummer:</span>{" "}
                           {testride.driverLicenseNumber}
                         </p>
                       )}
                       {testride.idCountryOfOrigin && (
                         <p>
                           <span className="text-muted-foreground">Land van herkomst ID/rijbewijs:</span>{" "}
                           {testride.idCountryOfOrigin}
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
                  <span className="text-muted-foreground">Verwachte eindtijd:</span>{" "}
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
                  <>
                    <p>
                      <span className="text-muted-foreground">
                        {testride.status === "COMPLETED" ? "Eind:" : "Verwachte eindkilometerstand:"}
                      </span>{" "}
                      {testride.endKm} km
                    </p>
                    <div className="pt-2 mt-2 border-t">
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Gereden kilometers:</span>{" "}
                        <span className="font-bold text-lg text-autoofy-red">
                          {testride.endKm - testride.startKm} km
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Eigen risico</h3>
              <p className="text-sm">€{testride.eigenRisico}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Aantal sleutels meegegeven</h3>
              <p className="text-sm">{testride.aantalSleutels}</p>
            </div>
          </div>

          {testride.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notities/ eventuele opmerking</h3>
              <p className="text-sm">{testride.notes}</p>
            </div>
          )}

          {(testride.idPhotoFrontUrl || testride.idPhotoBackUrl) && (
            <div>
              <h3 className="font-semibold mb-2">Rijbewijs of ID foto's</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testride.idPhotoFrontUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Voorkant</p>
                    <div className="border rounded-md p-4 bg-white">
                      <Image
                        src={testride.idPhotoFrontUrl}
                        alt="Rijbewijs of ID foto voorkant"
                        width={500}
                        height={300}
                        className="max-w-full h-auto object-contain rounded"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {testride.idPhotoBackUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Achterkant</p>
                    <div className="border rounded-md p-4 bg-white">
                      <Image
                        src={testride.idPhotoBackUrl}
                        alt="Rijbewijs of ID foto achterkant"
                        width={500}
                        height={300}
                        className="max-w-full h-auto object-contain rounded"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(testride.customerSignatureUrl || testride.sellerSignatureUrl || testride.completionSignatureUrl) && (
            <div>
              <h3 className="font-semibold mb-2">Handtekeningen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testride.customerSignatureUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Klant handtekening</p>
                    <div className="border rounded-md p-4 bg-white">
                      <img
                        src={testride.customerSignatureUrl}
                        alt="Klant handtekening"
                        className="max-w-full h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
                {testride.sellerSignatureUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Verkoper handtekening/stempel</p>
                    <div className="border rounded-md p-4 bg-white">
                      <img
                        src={testride.sellerSignatureUrl}
                        alt="Verkoper handtekening"
                        className="max-w-full h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
                {testride.completionSignatureUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Handtekening bij afronding</p>
                    <div className="border rounded-md p-4 bg-white border-green-500">
                      <img
                        src={testride.completionSignatureUrl}
                        alt="Handtekening bij afronding"
                        className="max-w-full h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <div className="flex items-center gap-2">
                  {testride.status === "COMPLETED" ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Afgerond</span>
                      {testride.completedAt && (
                        <span className="text-sm text-muted-foreground ml-2">
                          op {formatDateTime(testride.completedAt)}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-600 font-medium">Bezig met testrit</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-1">
            <p className="text-xs text-muted-foreground">
              Aangemaakt op: {formatDateTime(testride.createdAt)}
            </p>
            {testride.status === "COMPLETED" && testride.completedAt && (
              <p className="text-xs font-medium text-green-600">
                Afgerond op: {formatDateTime(testride.completedAt)}
              </p>
            )}
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

