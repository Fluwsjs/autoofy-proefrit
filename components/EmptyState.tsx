"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
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
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-12 pb-12 px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="rounded-full bg-autoofy-red/10 p-6">
            <Search className="h-12 w-12 text-autoofy-red" />
          </div>
          
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold text-autoofy-dark">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {showSearchHint && (
            <p className="text-sm text-muted-foreground">
              Probeer uw zoekopdracht aan te passen of gebruik andere filters
            </p>
          )}

          {!showSearchHint && (
            <Link href={actionHref}>
              <Button className="bg-autoofy-red text-white hover:bg-autoofy-red/90 shadow-lg transition-all duration-300 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                {actionLabel}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

