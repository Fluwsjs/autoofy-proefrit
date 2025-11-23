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
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-autoofy-dark mb-1">{testride.customerName}</h3>
            <p className="text-sm text-gray-600">{testride.customerEmail}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(testride.status)}`}>
            {getStatusText(testride.status)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-autoofy-red flex-shrink-0" />
            <span className="text-gray-700 truncate">{testride.carType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-autoofy-red flex-shrink-0" />
            <span className="text-gray-700">{formatDate(testride.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-autoofy-red flex-shrink-0" />
            <span className="text-gray-700">{testride.startTime} - {testride.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">KM:</span>
            <span className="text-gray-700 font-medium">{testride.startKm}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/dashboard/${testride.id}`} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full min-h-[40px]"
            >
              <Eye className="h-4 w-4 mr-1" />
              Bekijken
            </Button>
          </Link>
          
          {testride.status.toUpperCase() !== "COMPLETED" && (
            <>
              <Link href={`/dashboard/${testride.id}/edit`} className="flex-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full min-h-[40px]"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Bewerken
                </Button>
              </Link>
              <Link href={`/dashboard/${testride.id}/complete`} className="flex-1">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700 min-h-[40px]"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Afronden
                </Button>
              </Link>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(testride.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[40px] px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

