"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchAndFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  dateFilter: string
  onDateFilterChange: (filter: string) => void
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoeken op klantnaam, e-mail of autotype..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
        <Button
          variant={dateFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("all")}
          className={dateFilter === "all" ? "bg-autoofy-dark text-white hover:bg-autoofy-dark/90 whitespace-nowrap" : "whitespace-nowrap"}
        >
          Alle
        </Button>
        <Button
          variant={dateFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("today")}
          className={dateFilter === "today" ? "bg-autoofy-dark text-white hover:bg-autoofy-dark/90 whitespace-nowrap" : "whitespace-nowrap"}
        >
          Vandaag
        </Button>
        <Button
          variant={dateFilter === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("week")}
          className={dateFilter === "week" ? "bg-autoofy-dark text-white hover:bg-autoofy-dark/90 whitespace-nowrap" : "whitespace-nowrap"}
        >
          Deze week
        </Button>
        <Button
          variant={dateFilter === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("month")}
          className={dateFilter === "month" ? "bg-autoofy-dark text-white hover:bg-autoofy-dark/90 whitespace-nowrap" : "whitespace-nowrap"}
        >
          Deze maand
        </Button>
      </div>
    </div>
  )
}

