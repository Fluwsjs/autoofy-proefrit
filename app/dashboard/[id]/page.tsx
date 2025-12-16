"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime, formatTime } from "@/lib/utils"
import { ArrowLeft, Trash2, Download, CheckCircle, Car, Loader2 } from "lucide-react"
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
  dealerPlateCardGiven?: boolean
  seller: {
    id: string
    name: string
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
  vehicleSold?: boolean
  damagePhotoUrls?: string[]
  tenant?: {
    companyName: string | null
    companyAddress: string | null
    companyZipCode: string | null
    companyCity: string | null
    companyPhone: string | null
    companyKvK: string | null
    companyVAT: string | null
    companyLogo: string | null
  }
}

export default function TestrideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [testride, setTestride] = useState<Testride | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingVehicleSold, setUpdatingVehicleSold] = useState(false)

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

  const handleToggleVehicleSold = async () => {
    if (!testride) return
    
    setUpdatingVehicleSold(true)
    try {
      const response = await fetch(`/api/testrides/${testride.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleSold: !testride.vehicleSold,
        }),
      })

      if (response.ok) {
        const updatedTestride = await response.json()
        setTestride(updatedTestride)
      } else {
        alert("Fout bij bijwerken status")
      }
    } catch (error) {
      console.error("Error updating vehicle sold status:", error)
      alert("Fout bij bijwerken status")
    } finally {
      setUpdatingVehicleSold(false)
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
        dealerPlateCardGiven: testride.dealerPlateCardGiven,
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
        sellerName: testride.seller?.name || null,
        vehicleSold: testride.vehicleSold,
        damagePhotoUrls: testride.damagePhotoUrls,
        companyInfo: testride.tenant ? {
          companyName: testride.tenant.companyName,
          companyAddress: testride.tenant.companyAddress,
          companyZipCode: testride.tenant.companyZipCode,
          companyCity: testride.tenant.companyCity,
          companyPhone: testride.tenant.companyPhone,
          companyKvK: testride.tenant.companyKvK,
          companyVAT: testride.tenant.companyVAT,
          companyLogo: testride.tenant.companyLogo,
        } : undefined,
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
            {/* Desktop: All buttons visible */}
            <div className="hidden md:flex gap-2">
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
            
            {/* Mobile: Primary action prominent */}
            <div className="md:hidden">
              {testride.status !== "COMPLETED" && (
                <Link href={`/dashboard/${testride.id}/complete`}>
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Afronden
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile: Secondary actions */}
          <div className="md:hidden flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Verwijder
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
                  {formatTime(testride.startTime)}
                </p>
                <p>
                  <span className="text-muted-foreground">Verwachte eindtijd:</span>{" "}
                  {formatTime(testride.endTime)}
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
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
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
              
              {/* Voertuig verkocht toggle - alleen tonen bij afgeronde proefritten */}
              {testride.status === "COMPLETED" && (
                <div className="flex flex-col items-start md:items-end">
                  <h3 className="font-semibold mb-2">
                    {testride.vehicleSold ? "Voertuig verkocht" : "Voertuig niet verkocht"}
                  </h3>
                  <button
                    onClick={handleToggleVehicleSold}
                    disabled={updatingVehicleSold}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      testride.vehicleSold
                        ? 'border-green-500 bg-green-50 hover:bg-green-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    } ${updatingVehicleSold ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {updatingVehicleSold ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        testride.vehicleSold 
                          ? 'bg-green-500 text-white' 
                          : 'border-2 border-slate-300'
                      }`}>
                        {testride.vehicleSold && <CheckCircle className="h-4 w-4" />}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <Car className={`h-4 w-4 ${testride.vehicleSold ? 'text-green-600' : 'text-slate-400'}`} />
                        <span className={`font-medium ${testride.vehicleSold ? 'text-green-700' : 'text-slate-600'}`}>
                          {testride.vehicleSold ? '🎉 Verkocht!' : 'Niet verkocht'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Klik om status te wijzigen
                      </p>
                    </div>
                  </button>
                </div>
              )}
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

