"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FloatingActionButton() {
  return (
    <Link href="/dashboard/new">
      <Button
        size="lg"
        className="fixed bottom-5 right-5 h-14 px-4 rounded-full bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 shadow-2xl z-40 lg:hidden hover:shadow-xl transition-all duration-300 group flex items-center gap-2"
        aria-label="Nieuwe proefrit"
      >
        <div className="p-1 bg-white/20 rounded-full">
          <Plus className="h-5 w-5 text-white" />
        </div>
        <span className="text-white font-semibold text-sm whitespace-nowrap">
          Nieuwe Proefrit
        </span>
      </Button>
    </Link>
  )
}

