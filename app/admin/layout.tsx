import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ExternalLink, Menu, LogOut, Shield } from "lucide-react"
import { AdminMobileMenu } from "@/components/AdminMobileMenu"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isSuperAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a2744] to-[#0f1729] flex flex-col">
      {/* Custom Admin Header */}
      <header className="border-b border-white/10 bg-[#0f1729]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="https://www.autoofy.nl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-white">AUTOOFY</span>
                <span className="text-autoofy-red">•</span>
                <span className="text-white hidden sm:inline">NL</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
            </a>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <a href="/admin" className="text-sm font-medium text-white hover:text-autoofy-red transition-colors">
                Admin Dashboard
              </a>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="h-4 w-4" />
                <span>{session?.user?.name || "Support"}</span>
              </span>
              <a 
                href="/api/auth/signout" 
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Uitloggen</span>
              </a>
            </nav>

            {/* Mobile Menu */}
            <AdminMobileMenu userName={session?.user?.name || "Support"} />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-white/10 bg-[#0f1729]/80 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Autoofy. Alle rechten voorbehouden.</span>
            </div>
            <a 
              href="https://www.autoofy.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-autoofy-red font-medium transition-colors group"
            >
              <span>Bezoek www.autoofy.nl</span>
              <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

