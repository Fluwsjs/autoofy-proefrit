"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Menu, X, Home, Plus, CreditCard, Building2, 
  User, Settings, LogOut, Sparkles 
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
          <div className="p-4 border-b bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMenu}
                className="text-white hover:bg-white/10 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {session && (
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-md bg-slate-700 flex items-center justify-center text-white text-sm font-medium">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-slate-400">{session.user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    active
                      ? "bg-autoofy-red/10 text-autoofy-red border-r-2 border-autoofy-red"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-autoofy-red" : "text-slate-500"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}

            <div className="border-t border-slate-200 my-2"></div>

            {/* Settings Section */}
            <button
              onClick={() => {
                closeMenu()
                localStorage.removeItem('welcomeWizardShown')
                window.location.href = "/dashboard?openWizard=true&step=0"
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-autoofy-red" />
              <span className="text-sm font-medium">Onboarding</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-3">
            <Button
              variant="ghost"
              onClick={() => {
                closeMenu()
                signOut({ callbackUrl: "/" })
              }}
              className="w-full justify-start gap-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Uitloggen</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

