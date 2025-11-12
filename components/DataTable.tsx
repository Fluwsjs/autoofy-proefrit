"use client"

import { formatDate, formatTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trash2, Eye } from "lucide-react"

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
}

interface DataTableProps {
  testrides: Testride[]
  onDelete?: (id: string) => void
}

export function DataTable({ testrides, onDelete }: DataTableProps) {
  if (testrides.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Geen proefritten gevonden
          </p>
        </CardContent>
      </Card>
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
                <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Acties</th>
              </tr>
            </thead>
            <tbody>
              {testrides.map((testride, index) => (
                <tr 
                  key={testride.id} 
                  className="border-b hover:bg-blue-50/50 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-autoofy-light/20 text-autoofy-dark border border-autoofy-light/30">
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
                    <div className="flex gap-2">
                      <Link href={`/dashboard/${testride.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(testride.id)}
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
    </Card>
  )
}

