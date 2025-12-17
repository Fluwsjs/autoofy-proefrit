"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Filter } from "lucide-react"

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
  const filters = [
    { key: "all", label: "Alle" },
    { key: "today", label: "Vandaag" },
    { key: "week", label: "Deze week" },
    { key: "month", label: "Deze maand" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Zoeken op klantnaam, e-mail of autotype..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-autoofy-dark transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        )}
      </div>
      
      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-slate-100 p-1 rounded-lg">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant="ghost"
              size="sm"
              onClick={() => onDateFilterChange(filter.key)}
              className={`whitespace-nowrap rounded-md px-4 transition-all ${
                dateFilter === filter.key 
                  ? "bg-white text-slate-900 shadow-sm font-medium" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

