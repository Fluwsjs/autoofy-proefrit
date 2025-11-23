"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime } from "@/lib/utils"
import { CheckCircle, Clock, Download, ExternalLink } from "lucide-react"
import Link from "next/link"
import { exportTestrideToPDF } from "@/lib/pdf-export"

interface Testride {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  address: string
  carType: string
  licensePlate: string | null
  date: string
  startTime: string
  endTime: string
  startKm: number
  endKm: number | null
  status: string
  driverLicenseNumber: string | null
  idCountryOfOrigin?: string | null
  dealerPlate: {
    plate: string
  } | null
  // Optional fields that might come from the API
  idPhotoFrontUrl?: string | null
  idPhotoBackUrl?: string | null
  customerSignatureUrl?: string | null
  sellerSignatureUrl?: string | null
  completionSignatureUrl?: string | null
  eigenRisico?: number
  aantalSleutels?: number
  completedAt?: string | null
  notes?: string | null
  createdAt?: string
}

interface QuickViewModalProps {
  testrideId: string | null
  open: boolean
  onClose: () => void
}

export function QuickViewModal({ testrideId, open, onClose }: QuickViewModalProps) {
  const [testride, setTestride] = useState<Testride | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (testrideId && open) {
      fetchTestride(testrideId)
    }
  }, [testrideId, open])

  const fetchTestride = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/testrides/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTestride(data)
      }
    } catch (error) {
      console.error("Error fetching testride:", error)
    } finally {
      setLoading(false)
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
        idCountryOfOrigin: testride.idCountryOfOrigin ?? null,
        dealerPlate: testride.dealerPlate,
        idPhotoFrontUrl: testride.idPhotoFrontUrl ?? null,
        idPhotoBackUrl: testride.idPhotoBackUrl ?? null,
        customerSignatureUrl: testride.customerSignatureUrl ?? null,
        sellerSignatureUrl: testride.sellerSignatureUrl ?? null,
        completionSignatureUrl: testride.completionSignatureUrl ?? null,
        eigenRisico: testride.eigenRisico ?? 0,
        aantalSleutels: testride.aantalSleutels ?? 1,
        status: testride.status,
        completedAt: testride.completedAt ?? null,
        startKm: testride.startKm,
        endKm: testride.endKm,
        notes: testride.notes ?? null,
        createdAt: testride.createdAt ?? new Date().toISOString(),
      }
      
      await exportTestrideToPDF(testrideData)
    } catch (error) {
      console.error("Error exporting PDF:", error)
    }
  }

  if (!testride && !loading) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-autoofy-dark">
            Proefrit Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autoofy-red"></div>
          </div>
        ) : testride ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              {testride.status === "COMPLETED" ? (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-300">
                  <CheckCircle className="h-4 w-4" />
                  Afgerond
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                  <Clock className="h-4 w-4" />
                  Bezig met testrit
                </span>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="border-autoofy-dark text-autoofy-dark hover:bg-autoofy-dark/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Link href={`/dashboard/${testride.id}`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-autoofy-red text-white hover:bg-autoofy-red/90"
                  >
                    Volledige details
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Klantgegevens */}
            <div className="space-y-3">
              <h3 className="font-semibold text-autoofy-dark text-lg">Klantgegevens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Naam</p>
                  <p className="font-medium">{testride.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">E-mail</p>
                  <p className="font-medium">{testride.customerEmail}</p>
                </div>
                {testride.customerPhone && (
                  <div>
                    <p className="text-muted-foreground">Telefoon</p>
                    <p className="font-medium">{testride.customerPhone}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Adres</p>
                  <p className="font-medium">{testride.address}</p>
                </div>
              </div>
            </div>

            {/* Autogegevens */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-autoofy-dark text-lg">Autogegevens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{testride.carType}</p>
                </div>
                {testride.licensePlate && (
                  <div>
                    <p className="text-muted-foreground">Kenteken</p>
                    <p className="font-medium">{testride.licensePlate}</p>
                  </div>
                )}
                {testride.dealerPlate && (
                  <div>
                    <p className="text-muted-foreground">Handelaarskenteken</p>
                    <p className="font-medium">{testride.dealerPlate.plate}</p>
                  </div>
                )}
                {testride.driverLicenseNumber && (
                  <div>
                    <p className="text-muted-foreground">Rijbewijs/BSN</p>
                    <p className="font-medium">{testride.driverLicenseNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ritgegevens */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-autoofy-dark text-lg">Ritgegevens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Datum</p>
                  <p className="font-medium">{formatDate(testride.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tijd</p>
                  <p className="font-medium">
                    {formatDateTime(testride.startTime)} - {formatDateTime(testride.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start kilometers</p>
                  <p className="font-medium">{testride.startKm} km</p>
                </div>
                {testride.endKm !== null && (
                  <div>
                    <p className="text-muted-foreground">Eind kilometers</p>
                    <p className="font-medium">{testride.endKm} km</p>
                  </div>
                )}
                {testride.endKm !== null && (
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">Afstand</p>
                    <p className="font-medium text-autoofy-red font-semibold">
                      {testride.endKm - testride.startKm} km
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

