"use client"

import { useState, useEffect } from "react"
import { Menu, X, Shield, LogOut, ExternalLink, LayoutDashboard } from "lucide-react"
import Link from "next/link"

interface AdminMobileMenuProps {
  userName: string
}

export function AdminMobileMenu({ userName }: AdminMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Slide-out Menu */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 z-[110] w-[280px] max-w-[85vw] bg-[#0f1729] shadow-2xl shadow-black/50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-autoofy-dark/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-autoofy-red to-red-600 rounded-xl shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Admin Panel</p>
              <p className="text-xs text-slate-400 truncate max-w-[140px]">{userName}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white bg-autoofy-red/20 border border-autoofy-red/30 hover:bg-autoofy-red/30 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5 text-autoofy-red" />
            <span className="font-semibold">Dashboard</span>
          </Link>
          
          <a
            href="https://www.autoofy.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-slate-400" />
            <span className="font-medium">www.autoofy.nl</span>
          </a>
        </nav>

        {/* Footer with safe area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0a0f1a] pb-safe">
          <a
            href="/api/auth/signout"
            className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold">Uitloggen</span>
          </a>
        </div>
      </div>
    </>
  )
}
