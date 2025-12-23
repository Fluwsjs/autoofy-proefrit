"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, MessageSquare, User, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  isAction?: boolean
}

export function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/dashboard/new",
      label: "Nieuw",
      icon: <Plus className="h-5 w-5" />,
      isAction: true,
    },
    {
      href: "/dashboard/feedback",
      label: "Feedback",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/dashboard/profile",
      label: "Profiel",
      icon: <User className="h-5 w-5" />,
    },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Bottom Navigation - Only visible on mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href)
            
            if (item.isAction) {
              // Special styling for the action button (New)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-autoofy-red to-red-600 flex items-center justify-center shadow-lg shadow-autoofy-red/30 active:scale-95 transition-transform">
                    <Plus className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-autoofy-red mt-1">
                    {item.label}
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[64px]",
                  active 
                    ? "text-autoofy-red" 
                    : "text-gray-500 active:bg-gray-100"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  active && "bg-autoofy-red/10"
                )}>
                  {item.icon}
                </div>
                <span className={cn(
                  "text-[10px] mt-0.5 font-medium",
                  active && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="lg:hidden h-20" />
    </>
  )
}

