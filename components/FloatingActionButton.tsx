"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FloatingActionButton() {
  return (
    <Link href="/dashboard/new">
      <Button
        size="lg"
        className="fixed bottom-5 right-5 h-12 w-12 rounded-full bg-autoofy-red hover:bg-autoofy-red/90 shadow-lg z-40 lg:hidden hover:shadow-xl transition-shadow duration-150"
        aria-label="Nieuwe proefrit"
      >
        <Plus className="h-5 w-5 text-white" />
      </Button>
    </Link>
  )
}

