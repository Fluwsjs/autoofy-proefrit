"use client"

import { useState } from "react"
import { formatDate, formatTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trash2, Eye, CheckCircle } from "lucide-react"
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
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-autoofy-dark border-b">
        <CardTitle className="text-xl font-bold text-white">
          Proefritten ({testrides.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
                    {testride.status === "COMPLETED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                        <CheckCircle className="h-3 w-3" />
                        Afgerond
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                        In behandeling
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleQuickView(testride.id)}
                        className="hover:bg-autoofy-red/10 hover:text-autoofy-red transition-colors"
                        title="Snelle weergave"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(testride.id)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

