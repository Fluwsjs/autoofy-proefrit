"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { LogOut, ExternalLink, Settings, Building2, CreditCard, User, Users, ChevronDown, Sparkles } from "lucide-react"
import { NotificationCenter, Notification } from "@/components/NotificationCenter"
import { MobileNav } from "@/components/MobileNav"
import { useState, useEffect, useRef } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (session) {
      // Load notifications from localStorage or API
      const stored = localStorage.getItem('notifications')
      if (stored) {
        try {
          const parsed = JSON.parse(stored).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }))
          setNotifications(parsed)
        } catch (e) {
          console.error('Error loading notifications:', e)
        }
      }
    }
  }, [session])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n)
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const handleDismiss = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      localStorage.setItem('notifications', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center">
            <Image
              src="/autoofy-logo.svg"
              alt="Autoofy Logo"
              width={120}
              height={14}
              className="object-contain h-7 w-auto"
              priority
            />
          </Link>
          <a 
            href="https://www.autoofy.nl" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-autoofy-red transition-colors group/link"
            title="Bezoek Autoofy website"
          >
            <span>www.autoofy.nl</span>
            <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>
        </div>
        
        {session && (
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Navigation */}
            <MobileNav />
            {session.user.isSuperAdmin ? (
              <Link href="/admin" className="hidden lg:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="hidden md:inline">Admin Dashboard</span>
                  <span className="md:hidden">Admin</span>
                </Button>
              </Link>
            ) : (
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 text-sm text-slate-700">
                <span className="hidden lg:inline text-xs text-slate-500">Bedrijf:</span>
                <span className="font-medium">{session.user.tenantName}</span>
              </div>
            )}
            {!session.user.isSuperAdmin && (
              <>
                <div className="hidden lg:block">
                  <NotificationCenter
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                    onMarkAllAsRead={handleMarkAllAsRead}
                  />
                </div>
                
                {/* Settings Dropdown - Desktop only */}
                <div className="relative hidden lg:block" ref={settingsRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="gap-1.5 hover:bg-slate-50 h-9 text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden lg:inline">Instellingen</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {settingsOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setSettingsOpen(false)
                          localStorage.removeItem('welcomeWizardShown')
                          window.location.href = "/dashboard?openWizard=true&step=0"
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Sparkles className="h-4 w-4 text-autoofy-red" />
                        <div>
                          <p className="text-sm font-medium">Onboarding Wizard</p>
                          <p className="text-xs text-gray-500">Start de setup opnieuw</p>
                        </div>
                      </button>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <Link
                        href="/dashboard/company-info"
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <Building2 className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium">Bedrijfsgegevens</p>
                          <p className="text-xs text-gray-500">Beheer je bedrijfsinfo</p>
                        </div>
                      </Link>
                      
                      <Link
                        href="/dashboard/dealer-plates"
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <CreditCard className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium">Handelaarskentekens</p>
                          <p className="text-xs text-gray-500">Beheer kentekens</p>
                        </div>
                      </Link>
                      
                      <Link
                        href="/dashboard/sellers"
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <Users className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium">Verkopers</p>
                          <p className="text-xs text-gray-500">Beheer verkopers</p>
                        </div>
                      </Link>
                      
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setSettingsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium">Mijn Profiel</p>
                          <p className="text-xs text-gray-500">Persoonlijke instellingen</p>
                        </div>
                      </Link>
                      
                      {session.user.role === "ADMIN" && (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          <Link
                            href="/dashboard/users"
                            onClick={() => setSettingsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <Users className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium">Gebruikers</p>
                              <p className="text-xs text-gray-500">Beheer teamleden</p>
                            </div>
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="hidden lg:flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-medium">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-900">{session.user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden lg:flex hover:bg-slate-50 h-9 text-sm"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Uitloggen
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

