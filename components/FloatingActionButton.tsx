"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FloatingActionButton() {
  return (
    <Link href="/dashboard/new">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-autoofy-red hover:bg-autoofy-red/90 shadow-2xl z-40 lg:hidden group hover:scale-110 transition-all duration-300"
        aria-label="Nieuwe proefrit"
      >
        <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </Button>
    </Link>
  )
}

