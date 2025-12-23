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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-autoofy-red" />
        <p className="text-sm text-gray-500">Laden...</p>
      </div>
    )
  }

  if (!testride) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-8">
      {/* Back button */}
      <Link href="/dashboard" className="inline-block">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 -ml-2 sm:ml-0">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span className="text-sm">Terug naar dashboard</span>
        </Button>
      </Link>

      <Card className="border-0 sm:border shadow-sm sm:shadow-md overflow-hidden">
        <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-slate-50 to-white border-b">
          {/* Mobile Header */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center justify-between">
              <Image
                src="/autoofy-logo.svg"
                alt="Autoofy Logo"
                width={120}
                height={14}
                className="object-contain"
                priority
              />
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                testride.status === "COMPLETED" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {testride.status === "COMPLETED" ? "Afgerond" : "Actief"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Proefrit Details</h1>
            
            {/* Mobile Action Buttons */}
            <div className="flex gap-2">
              {testride.status !== "COMPLETED" && (
                <Link href={`/dashboard/${testride.id}/complete`} className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-green-600 text-white hover:bg-green-700 h-10"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Afronden
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className={`h-10 ${testride.status === "COMPLETED" ? "flex-1" : ""}`}
              >
                <Download className="h-4 w-4 mr-1.5" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="h-10 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
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
        <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6">
          {/* Klantgegevens */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Klantgegevens
            </h3>
            <div className="grid gap-2 text-sm bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Naam</span>
                <span className="font-medium text-gray-900">{testride.customerName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">E-mail</span>
                <span className="font-medium text-gray-900 break-all">{testride.customerEmail}</span>
              </div>
              {testride.customerPhone && (
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Telefoon</span>
                  <span className="font-medium text-gray-900">{testride.customerPhone}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Adres</span>
                <span className="font-medium text-gray-900">{testride.address}</span>
              </div>
            </div>
          </section>

          {/* Voertuiggegevens */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-1 h-4 bg-green-500 rounded-full"></span>
              Voertuiggegevens
            </h3>
            <div className="grid gap-2 text-sm bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Voertuig</span>
                <span className="font-medium text-gray-900">{testride.carType}</span>
              </div>
              {testride.licensePlate && (
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Kenteken</span>
                  <span className="font-medium text-gray-900">{testride.licensePlate}</span>
                </div>
              )}
              {testride.dealerPlate && (
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Handelaarskenteken</span>
                  <span className="font-medium text-gray-900">{testride.dealerPlate.plate}</span>
                </div>
              )}
              {testride.driverLicenseNumber && (
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Rijbewijs/BSN</span>
                  <span className="font-medium text-gray-900">{testride.driverLicenseNumber}</span>
                </div>
              )}
              {testride.idCountryOfOrigin && (
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm min-w-[80px]">Land ID</span>
                  <span className="font-medium text-gray-900">{testride.idCountryOfOrigin}</span>
                </div>
              )}
            </div>
          </section>

          {/* Ritgegevens & Kilometerstand - side by side on mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <section className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                Ritgegevens
              </h3>
              <div className="grid gap-1.5 text-sm bg-gray-50 rounded-lg p-3 sm:p-4">
                <div>
                  <span className="text-gray-500 text-xs block">Datum</span>
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">{formatDate(testride.date)}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Starttijd</span>
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">{formatTime(testride.startTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Eindtijd</span>
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">{formatTime(testride.endTime)}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                Kilometers
              </h3>
              <div className="grid gap-1.5 text-sm bg-gray-50 rounded-lg p-3 sm:p-4">
                <div>
                  <span className="text-gray-500 text-xs block">Start</span>
                  <span className="font-medium text-gray-900 text-xs sm:text-sm">{testride.startKm} km</span>
                </div>
                {testride.endKm !== null && (
                  <>
                    <div>
                      <span className="text-gray-500 text-xs block">Eind</span>
                      <span className="font-medium text-gray-900 text-xs sm:text-sm">{testride.endKm} km</span>
                    </div>
                    <div className="pt-1.5 mt-1.5 border-t border-gray-200">
                      <span className="text-gray-500 text-xs block">Gereden</span>
                      <span className="font-bold text-autoofy-red text-sm sm:text-base">
                        {testride.endKm - testride.startKm} km
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Extra info row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <span className="text-gray-500 text-xs block mb-1">Eigen risico</span>
              <span className="font-semibold text-gray-900">€{testride.eigenRisico}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <span className="text-gray-500 text-xs block mb-1">Sleutels</span>
              <span className="font-semibold text-gray-900">{testride.aantalSleutels} stuks</span>
            </div>
          </div>

          {testride.notes && (
            <section className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-gray-400 rounded-full"></span>
                Notities
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-sm text-gray-700">{testride.notes}</p>
              </div>
            </section>
          )}

          {(testride.idPhotoFrontUrl || testride.idPhotoBackUrl) && (
            <section className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                ID Foto's
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {testride.idPhotoFrontUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Voorkant</p>
                    <div className="border border-gray-200 rounded-lg p-2 bg-white">
                      <Image
                        src={testride.idPhotoFrontUrl}
                        alt="ID voorkant"
                        width={500}
                        height={300}
                        className="w-full h-auto object-contain rounded"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {testride.idPhotoBackUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Achterkant</p>
                    <div className="border border-gray-200 rounded-lg p-2 bg-white">
                      <Image
                        src={testride.idPhotoBackUrl}
                        alt="ID achterkant"
                        width={500}
                        height={300}
                        className="w-full h-auto object-contain rounded"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {(testride.customerSignatureUrl || testride.sellerSignatureUrl || testride.completionSignatureUrl) && (
            <section className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
                Handtekeningen
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {testride.customerSignatureUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Klant</p>
                    <div className="border border-gray-200 rounded-lg p-2 bg-white aspect-[3/2] flex items-center justify-center">
                      <img
                        src={testride.customerSignatureUrl}
                        alt="Klant handtekening"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                {testride.sellerSignatureUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Verkoper</p>
                    <div className="border border-gray-200 rounded-lg p-2 bg-white aspect-[3/2] flex items-center justify-center">
                      <img
                        src={testride.sellerSignatureUrl}
                        alt="Verkoper handtekening"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                {testride.completionSignatureUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Afronding</p>
                    <div className="border-2 border-green-400 rounded-lg p-2 bg-green-50 aspect-[3/2] flex items-center justify-center">
                      <img
                        src={testride.completionSignatureUrl}
                        alt="Afronding handtekening"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Status Section */}
          <section className="pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {/* Status info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {testride.status === "COMPLETED" ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-green-700 font-semibold text-sm">Afgerond</span>
                        {testride.completedAt && (
                          <p className="text-xs text-gray-500">
                            {formatDateTime(testride.completedAt)}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Car className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-amber-700 font-semibold text-sm">Bezig met testrit</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Voertuig verkocht toggle */}
              {testride.status === "COMPLETED" && (
                <button
                  onClick={handleToggleVehicleSold}
                  disabled={updatingVehicleSold}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                    testride.vehicleSold
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  } ${updatingVehicleSold ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
                >
                  <div className="flex items-center gap-3">
                    {updatingVehicleSold ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        testride.vehicleSold 
                          ? 'bg-green-500 text-white' 
                          : 'border-2 border-gray-300 bg-white'
                      }`}>
                        {testride.vehicleSold && <CheckCircle className="h-4 w-4" />}
                      </div>
                    )}
                    <div className="text-left">
                      <span className={`font-medium text-sm ${testride.vehicleSold ? 'text-green-700' : 'text-gray-700'}`}>
                        {testride.vehicleSold ? '🎉 Voertuig verkocht!' : 'Voertuig niet verkocht'}
                      </span>
                      <p className="text-xs text-gray-500">Tik om te wijzigen</p>
                    </div>
                  </div>
                  <Car className={`h-5 w-5 ${testride.vehicleSold ? 'text-green-500' : 'text-gray-400'}`} />
                </button>
              )}
            </div>
          </section>

          {/* Footer info */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Aangemaakt: {formatDateTime(testride.createdAt)}
            </p>
          </div>

          {/* Voorwaarden */}
          <div className="pt-4 border-t border-gray-200">
            <TermsAndConditions />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

