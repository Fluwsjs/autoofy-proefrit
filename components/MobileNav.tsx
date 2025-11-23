"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Menu, X, Home, Plus, CreditCard, Building2, 
  User, Users, BarChart3, Settings, LogOut, Sparkles 
} from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/new", label: "Nieuwe Proefrit", icon: Plus },
    { href: "/dashboard/dealer-plates", label: "Handelaarskentekens", icon: CreditCard },
    { href: "/dashboard/company-info", label: "Bedrijfsgegevens", icon: Building2 },
    { href: "/dashboard/profile", label: "Mijn Profiel", icon: User },
  ]

  if (session?.user?.role === "ADMIN") {
    navItems.push({ href: "/dashboard/users", label: "Gebruikers", icon: Users })
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="lg:hidden"
        aria-label="Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-autoofy-dark to-autoofy-dark/90">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMenu}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {session && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-autoofy-red flex items-center justify-center text-white font-semibold">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-white/70">{session.user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                    active
                      ? "bg-autoofy-red/10 text-autoofy-red border-r-4 border-autoofy-red"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-autoofy-red" : "text-gray-500"}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}

            <div className="border-t my-4"></div>

            {/* Settings Section */}
            <button
              onClick={() => {
                closeMenu()
                localStorage.removeItem('welcomeWizardShown')
                window.location.href = "/dashboard?openWizard=true&step=0"
              }}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Sparkles className="h-5 w-5 text-autoofy-red" />
              <span className="font-medium">Onboarding</span>
            </button>

            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Statistieken</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              onClick={() => {
                closeMenu()
                signOut({ callbackUrl: "/" })
              }}
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Uitloggen</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

