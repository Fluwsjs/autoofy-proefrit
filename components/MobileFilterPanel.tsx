"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Filter, X, Search, Calendar, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFilterPanelProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  dateFilter: string
  onDateFilterChange: (filter: string) => void
  resultCount: number
  totalCount: number
}

export function MobileFilterPanel({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  resultCount,
  totalCount,
}: MobileFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasActiveFilters = searchQuery || dateFilter !== "all"
  
  const dateOptions = [
    { value: "all", label: "Alle" },
    { value: "today", label: "Vandaag" },
    { value: "week", label: "Deze week" },
    { value: "month", label: "Deze maand" },
  ]

  const clearFilters = () => {
    onSearchChange("")
    onDateFilterChange("all")
  }

  return (
    <div className="lg:hidden">
      {/* Collapsed state - filter button */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
            isExpanded 
              ? "bg-autoofy-red text-white" 
              : hasActiveFilters
                ? "bg-autoofy-red/10 text-autoofy-red border border-autoofy-red/20"
                : "bg-white text-gray-700 border border-gray-200 shadow-sm"
          )}
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {hasActiveFilters && !isExpanded && (
            <span className="w-5 h-5 rounded-full bg-autoofy-red text-white text-xs flex items-center justify-center">
              {(searchQuery ? 1 : 0) + (dateFilter !== "all" ? 1 : 0)}
            </span>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </button>

        {/* Quick filter chips */}
        {!isExpanded && (
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
            {dateOptions.slice(1).map((option) => (
              <button
                key={option.value}
                onClick={() => onDateFilterChange(
                  dateFilter === option.value ? "all" : option.value
                )}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  dateFilter === option.value
                    ? "bg-autoofy-dark text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expanded filter panel */}
      {isExpanded && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 mb-4 animate-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Zoeken
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Naam, email of auto..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-autoofy-red/20 focus:border-autoofy-red"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Date filter */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Periode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onDateFilterChange(option.value)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                    dateFilter === option.value
                      ? "bg-autoofy-dark text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results & actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{resultCount}</span> van {totalCount} resultaten
            </p>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                >
                  Wis filters
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="bg-autoofy-red hover:bg-autoofy-red/90 h-8"
              >
                Toon resultaten
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active filter indicator when collapsed */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{resultCount}</span> van {totalCount} proefritten
          </p>
          <button
            onClick={clearFilters}
            className="text-xs text-autoofy-red font-medium hover:underline"
          >
            Wis filters
          </button>
        </div>
      )}
    </div>
  )
}

