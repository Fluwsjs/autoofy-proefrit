"use client"

import { useState } from "react"
import { formatDate, formatTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trash2, Eye, CheckCircle, Clock, PlayCircle, XCircle, Car, Edit, FileCheck } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { QuickViewModal } from "@/components/QuickViewModal"

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

interface DataTableProps {
  testrides: Testride[]
  onDelete?: (id: string) => void
  showEmptyState?: boolean
}

const getStatusBadge = (status: string) => {
  const statusUpper = status.toUpperCase()
  
  // COMPLETED status
  if (statusUpper === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="h-3.5 w-3.5" />
        Afgerond
      </span>
    )
  }
  
  // PENDING status (default for new testrides)
  if (statusUpper === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock className="h-3.5 w-3.5" />
        Bezig met testrit
      </span>
    )
  }
  
  // Fallback for any other status
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
      {status}
    </span>
  )
}

export function DataTable({ testrides, onDelete, showEmptyState = true }: DataTableProps) {
  const [quickViewId, setQuickViewId] = useState<string | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleQuickView = (id: string) => {
    setQuickViewId(id)
    setQuickViewOpen(true)
  }

  if (testrides.length === 0) {
    return (
      <>
        {showEmptyState ? (
          <EmptyState 
            showSearchHint={false}
            title="Nog geen proefritten"
            description="Begin met het toevoegen van uw eerste proefrit om te starten."
          />
        ) : (
          <EmptyState 
            showSearchHint={true}
            title="Geen resultaten gevonden"
            description="Er zijn geen proefritten die voldoen aan uw zoekcriteria."
          />
        )}
      </>
    )
  }

  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-autoofy-dark via-gray-800 to-autoofy-dark border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Car className="h-5 w-5" />
            </div>
            Proefritten
            <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
              {testrides.length}
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Card View */}
        <div className="block md:hidden divide-y">
          {testrides.map((testride) => (
            <div key={testride.id} className="p-4 space-y-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{testride.customerName}</div>
                  <div className="text-sm text-muted-foreground">{testride.customerEmail}</div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleQuickView(testride.id)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(testride.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Auto:</span>
                  <span className="ml-2 font-medium">{testride.carType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Datum:</span>
                  <span className="ml-2 font-medium">{formatDate(testride.date)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tijd:</span>
                  <span className="ml-2">{formatTime(testride.startTime)} - {formatTime(testride.endTime)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2">
                    {getStatusBadge(testride.status)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Kilometers:</span>
                  <span className="ml-2 font-medium">{testride.startKm}</span>
                  {testride.endKm !== null && (
                    <span className="text-muted-foreground"> → {testride.endKm}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Klant</th>
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Auto</th>
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Datum</th>
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Tijd</th>
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Kilometers</th>
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Status</th>
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Acties</th>
              </tr>
            </thead>
            <tbody>
              {testrides.map((testride, index) => (
                <tr 
                  key={testride.id} 
                  className="border-b hover:bg-blue-50/50 transition-all duration-200 group animate-in fade-in slide-in-from-bottom-4"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '300ms'
                  }}
                >
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-foreground">{testride.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {testride.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-autoofy-red/20 text-autoofy-dark border border-autoofy-red/30">
                      {testride.carType}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{formatDate(testride.date)}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatTime(testride.startTime)} - {formatTime(testride.endTime)}
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{testride.startKm}</span>
                    {testride.endKm !== null && (
                      <span className="text-muted-foreground"> → {testride.endKm}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(testride.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleQuickView(testride.id)}
                        className="hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                        title="Snelle weergave"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/${testride.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                          title="Details bekijken"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {testride.status !== "COMPLETED" && (
                        <Link href={`/dashboard/${testride.id}/complete`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-green-100 hover:text-green-600 transition-all duration-200 hover:scale-110"
                            title="Proefrit afronden"
                          >
                            <FileCheck className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(testride.id)}
                          className="hover:bg-red-100 hover:text-red-600 transition-all duration-200 hover:scale-110"
                          title="Verwijderen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      <QuickViewModal
        testrideId={quickViewId}
        open={quickViewOpen}
        onClose={() => {
          setQuickViewOpen(false)
          setQuickViewId(null)
        }}
      />
    </Card>
  )
}

