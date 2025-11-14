"use client"

import { Card, CardContent } from "@/components/ui/card"

export function SkeletonCard() {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-white/60 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-white/60 rounded animate-pulse"></div>
          </div>
          <div className="p-3 rounded-xl bg-autoofy-dark/20 w-14 h-14 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonTable() {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="bg-autoofy-dark h-16 animate-pulse"></div>
        <div className="space-y-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-48 bg-muted/60 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse"></div>
      </div>
      <div className="h-10 w-36 bg-muted rounded animate-pulse"></div>
    </div>
  )
}

