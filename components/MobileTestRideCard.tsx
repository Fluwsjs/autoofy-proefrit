"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Edit, CheckCircle, Trash2, Calendar, Car, User, Clock } from "lucide-react"
import Link from "next/link"

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

interface MobileTestRideCardProps {
  testride: Testride
  onDelete: (id: string) => void
}

export function MobileTestRideCard({ testride, onDelete }: MobileTestRideCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200"
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "Afgerond"
      case "PENDING":
        return "Bezig met testrit"
      default:
        return status
    }
  }

  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow duration-150">
      <CardContent className="p-3">
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-slate-900 mb-0.5">{testride.customerName}</h3>
            <p className="text-xs text-slate-600">{testride.customerEmail}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(testride.status)}`}>
            {getStatusText(testride.status)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Car className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700 truncate">{testride.carType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700">{formatDate(testride.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-700">{testride.startTime} - {testride.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">KM:</span>
            <span className="text-slate-700 font-medium">{testride.startKm}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <Link href={`/dashboard/${testride.id}`} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs border-slate-200"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Bekijken
            </Button>
          </Link>
          
          {testride.status.toUpperCase() !== "COMPLETED" && (
            <>
              <Link href={`/dashboard/${testride.id}/edit`} className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-8 text-xs border-slate-200"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Bewerken
                </Button>
              </Link>
              <Link href={`/dashboard/${testride.id}/complete`} className="flex-1">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Afronden
                </Button>
              </Link>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(testride.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

