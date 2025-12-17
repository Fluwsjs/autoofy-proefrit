"use client"

import { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  BarChart3,
  Building2,
  CreditCard,
  Users,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  ExternalLink,
  Sparkles,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number | string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const mainNavItems: NavSection[] = [
    {
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          label: "Nieuwe Proefrit",
          href: "/dashboard/new",
          icon: <Plus className="h-5 w-5" />,
        },
        {
          label: "Feedback",
          href: "/dashboard/feedback",
          icon: <MessageSquare className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Instellingen",
      items: [
        {
          label: "Bedrijfsgegevens",
          href: "/dashboard/company-info",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          label: "Handelaarskentekens",
          href: "/dashboard/dealer-plates",
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          label: "Verkopers",
          href: "/dashboard/sellers",
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Mijn Profiel",
          href: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
        },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href)
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          active
            ? "bg-autoofy-red text-white shadow-lg shadow-autoofy-red/25"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        )}
      >
        <span className={cn(
          "flex-shrink-0 transition-transform duration-200",
          !active && "group-hover:scale-110"
        )}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className="font-medium text-sm truncate">{item.label}</span>
            {item.badge && (
              <span className={cn(
                "ml-auto px-2 py-0.5 text-xs font-semibold rounded-full",
                active ? "bg-white/20" : "bg-autoofy-red/80 text-white"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-autoofy-red text-white text-xs font-bold rounded-full flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-white/10",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/dashboard" className="flex items-center gap-3">
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-autoofy-red to-red-600 flex items-center justify-center shadow-lg">
              <Car className="h-5 w-5 text-white" />
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-autoofy-red to-red-600 flex items-center justify-center shadow-lg">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg tracking-tight">Autoofy</span>
                <span className="text-xs text-slate-400 -mt-0.5">Proefrit Beheer</span>
              </div>
            </>
          )}
        </Link>
        
        {/* Collapse button - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User Info */}
      {session && !collapsed && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold shadow-inner">
              {session.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session.user?.tenantName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">
        {mainNavItems.map((section, idx) => (
          <div key={idx}>
            {section.title && !collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            {section.title && collapsed && (
              <div className="border-t border-white/10 my-2" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        {/* Website Link */}
        <a
          href="https://www.autoofy.nl"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all group",
            collapsed && "justify-center"
          )}
        >
          <ExternalLink className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">www.autoofy.nl</span>}
        </a>
        
        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Uitloggen</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-autoofy-dark text-white shadow-lg hover:bg-autoofy-dark/90 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-autoofy-dark via-slate-800 to-slate-900 transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-gradient-to-b from-autoofy-dark via-slate-800 to-slate-900 border-r border-white/10 transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Spacer for main content */}
      <div
        className={cn(
          "hidden lg:block flex-shrink-0 transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      />
    </>
  )
}

