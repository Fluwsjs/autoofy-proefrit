"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, Trash2, Calendar, Car, Clock, ChevronRight, MapPin } from "lucide-react"
import Link from "next/link"
import { SwipeableCard } from "./SwipeableCard"
import { useState } from "react"

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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return "Vandaag"
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Morgen"
    }
    return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })
  }

  const formatTime = (timeString: string) => {
    // Handle ISO date string
    if (timeString.includes('T')) {
      const date = new Date(timeString)
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    }
    return timeString
  }

  const isCompleted = testride.status.toUpperCase() === "COMPLETED"
  const isPending = testride.status.toUpperCase() === "PENDING"

  const handleDeleteClick = () => {
    if (showConfirmDelete) {
      onDelete(testride.id)
      setShowConfirmDelete(false)
    } else {
      setShowConfirmDelete(true)
      // Reset after 3 seconds
      setTimeout(() => setShowConfirmDelete(false), 3000)
    }
  }

  const cardContent = (
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <CardContent className="p-0">
        {/* Main content - clickable to view details */}
        <Link href={`/dashboard/${testride.id}`} className="block">
          <div className="p-4">
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {testride.customerName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Car className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{testride.carType}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {isCompleted ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Afgerond
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    Actief
                  </span>
                )}
              </div>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(testride.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(testride.startTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{testride.startKm} km</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Action buttons row */}
        <div className="flex items-center border-t border-gray-100 divide-x divide-gray-100">
          <Link href={`/dashboard/${testride.id}`} className="flex-1">
            <button className="w-full py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-1.5">
              <Eye className="h-4 w-4" />
              Bekijk
            </button>
          </Link>
          
          {!isCompleted && (
            <Link href={`/dashboard/${testride.id}/complete`} className="flex-1">
              <button className="w-full py-3 text-sm font-medium text-green-600 hover:bg-green-50 active:bg-green-100 transition-colors flex items-center justify-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Afronden
              </button>
            </Link>
          )}
          
          <button 
            onClick={(e) => {
              e.preventDefault()
              handleDeleteClick()
            }}
            className={`py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              showConfirmDelete 
                ? 'bg-red-500 text-white' 
                : 'text-red-500 hover:bg-red-50 active:bg-red-100'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            {showConfirmDelete ? 'Bevestig' : ''}
          </button>
        </div>
      </CardContent>
    </Card>
  )

  // Wrap with swipeable on mobile
  return (
    <SwipeableCard
      leftAction={{
        icon: <Trash2 className="h-5 w-5" />,
        label: "Verwijder",
        color: "bg-red-500",
        onClick: () => onDelete(testride.id)
      }}
      rightAction={!isCompleted ? {
        icon: <CheckCircle className="h-5 w-5" />,
        label: "Afronden",
        color: "bg-green-500",
        onClick: () => {
          window.location.href = `/dashboard/${testride.id}/complete`
        }
      } : undefined}
    >
      {cardContent}
    </SwipeableCard>
  )
}
