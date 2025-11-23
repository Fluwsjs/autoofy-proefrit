"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { LogOut, ExternalLink, Settings, Building2, CreditCard, User, Users, ChevronDown, Sparkles } from "lucide-react"
import { NotificationCenter, Notification } from "@/components/NotificationCenter"
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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center group">
            <Image
              src="/autoofy-logo.svg"
              alt="Autoofy Logo"
              width={152}
              height={17}
              className="object-contain h-10 w-auto"
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
          <div className="flex items-center gap-2 sm:gap-4">
            {session.user.isSuperAdmin ? (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
                <span className="text-xs text-muted-foreground">Bedrijf:</span>
                <span className="text-sm font-medium">{session.user.tenantName}</span>
              </div>
            )}
            {!session.user.isSuperAdmin && (
              <>
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismiss}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
                
                {/* Settings Dropdown */}
                <div className="relative" ref={settingsRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="gap-2 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Instellingen</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
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
            <div className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg bg-autoofy-red/10 border border-autoofy-red/20">
              <div className="h-8 w-8 rounded-full bg-autoofy-dark flex items-center justify-center text-white text-sm font-semibold">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-autoofy-dark hidden sm:inline">{session.user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Uitloggen</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

