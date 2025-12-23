"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

// Route name mappings
const routeNames: Record<string, string> = {
  "dashboard": "Dashboard",
  "new": "Nieuwe Proefrit",
  "dealer-plates": "Handelaarskentekens",
  "sellers": "Verkopers",
  "company-info": "Bedrijfsgegevens",
  "profile": "Mijn Profiel",
  "feedback": "Klant Feedback",
  "complete": "Afronden",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  // Don't show breadcrumbs on main dashboard
  if (pathname === "/dashboard") {
    return null
  }

  // Parse the pathname into breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean)
  
  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/")
    
    // Check if this is an ID (UUID or similar)
    const isId = /^[a-f0-9-]{20,}$/i.test(segment)
    
    let label = routeNames[segment] || segment
    if (isId) {
      label = "Details"
    }
    
    // Last item doesn't have a link
    const isLast = index === pathSegments.length - 1
    
    return {
      label,
      href: isLast ? undefined : href,
    }
  })

  return (
    <nav className="flex items-center gap-1 text-sm mb-4 overflow-x-auto scrollbar-hide">
      {/* Home icon */}
      <Link 
        href="/dashboard"
        className="flex items-center gap-1 text-gray-500 hover:text-autoofy-red transition-colors shrink-0"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.slice(1).map((item, index) => (
        <div key={index} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-autoofy-red transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

