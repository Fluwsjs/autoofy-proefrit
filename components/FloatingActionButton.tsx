"use client"

import Link from "next/link"
import { Plus, X, Car, FileText, Settings } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface QuickAction {
  href: string
  label: string
  icon: React.ReactNode
  color: string
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  const quickActions: QuickAction[] = [
    {
      href: "/dashboard/new",
      label: "Nieuwe Proefrit",
      icon: <Car className="h-5 w-5" />,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      href: "/dashboard/dealer-plates",
      label: "Kentekens",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      href: "/dashboard/company-info",
      label: "Instellingen",
      icon: <Settings className="h-5 w-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  return (
    <>
      {/* Overlay when FAB menu is open */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Container - Only on mobile, hidden when bottom nav has the + button */}
      <div className="hidden fixed bottom-24 right-4 z-50 flex-col-reverse items-end gap-3">
        {/* Quick Actions */}
        {isOpen && quickActions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 pl-4 pr-2 py-2 rounded-full text-white shadow-lg transition-all",
              action.color,
              "animate-in slide-in-from-bottom-2 fade-in duration-200"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {action.icon}
            </div>
          </Link>
        ))}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
            isOpen 
              ? "bg-gray-800 rotate-45" 
              : "bg-gradient-to-br from-autoofy-red to-red-600 shadow-autoofy-red/30"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-7 w-7 text-white" />
          )}
        </button>
      </div>
    </>
  )
}
