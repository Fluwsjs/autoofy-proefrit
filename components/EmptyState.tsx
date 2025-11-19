"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Car, Calendar, FileCheck, Sparkles } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  showSearchHint?: boolean
}

export function EmptyState({
  title = "Nog geen proefritten",
  description = "Begin met het toevoegen van uw eerste proefrit om te starten.",
  actionLabel = "Nieuwe Proefrit",
  actionHref = "/dashboard/new",
  showSearchHint = false,
}: EmptyStateProps) {
  if (showSearchHint) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-12 pb-12 px-6">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="rounded-full bg-gray-100 p-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl font-bold text-autoofy-dark">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
              <p className="text-sm text-muted-foreground pt-2">
                Probeer uw zoekopdracht aan te passen of gebruik andere filters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-autoofy-red/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <CardContent className="pt-16 pb-16 px-6 relative">
        <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto">
          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-autoofy-red/20 rounded-2xl blur-xl animate-pulse"></div>
            <div className="relative rounded-2xl bg-gradient-to-br from-autoofy-red to-red-600 p-6 shadow-2xl">
              <Car className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          
          {/* Title & Description */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-autoofy-dark">
              {title}
            </h3>
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Plan proefritten</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileCheck className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Digitale handtekening</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Car className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Realtime tracking</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link href={actionHref} className="w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-autoofy-red to-red-600 text-white hover:from-autoofy-red/90 hover:to-red-600/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-14 px-8 text-lg font-semibold group w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              {actionLabel}
            </Button>
          </Link>

          {/* Help Text */}
          <p className="text-sm text-gray-500">
            Maak uw eerste proefrit aan in minder dan 2 minuten
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

