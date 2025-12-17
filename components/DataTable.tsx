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
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-autoofy-dark">
              <Car className="h-4 w-4 text-white" />
            </div>
            Proefritten
            <span className="text-sm font-medium bg-autoofy-dark/10 text-autoofy-dark px-3 py-1 rounded-full">
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Klant</th>
                <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Auto</th>
                <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Datum</th>
                <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Tijd</th>
                <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">KM Stand</th>
                <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {testrides.map((testride, index) => (
                <tr 
                  key={testride.id} 
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                        {testride.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{testride.customerName}</div>
                        <div className="text-sm text-slate-500">
                          {testride.customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                      {testride.carType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{formatDate(testride.date)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="font-mono">{formatTime(testride.startTime)}</span>
                    <span className="text-slate-400 mx-1">–</span>
                    <span className="font-mono">{formatTime(testride.endTime)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-900">{testride.startKm.toLocaleString()}</span>
                    {testride.endKm !== null && (
                      <span className="text-slate-400 font-mono"> → {testride.endKm.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(testride.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleQuickView(testride.id)}
                        className="h-8 w-8 hover:bg-slate-100 hover:text-slate-900"
                        title="Snelle weergave"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/${testride.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-100 hover:text-slate-900"
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
                            className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
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
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
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

