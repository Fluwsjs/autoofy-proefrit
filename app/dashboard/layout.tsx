import { Sidebar } from "@/components/Sidebar"
import { BottomNav } from "@/components/BottomNav"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { ReactNode } from "react"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  // Redirect super admins to admin dashboard
  if (session.user?.isSuperAdmin) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 min-w-0">
        {/* Top Bar for mobile */}
        <div className="lg:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-center shadow-sm sticky top-0 z-30">
          <span className="font-bold text-autoofy-dark text-lg">Autoofy</span>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto pb-4 lg:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Breadcrumbs */}
            <Breadcrumbs />
            {children}
          </div>
        </main>
        
        {/* Footer - hidden on mobile */}
        <footer className="hidden lg:block border-t bg-white/50 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-500">
            <span>© {new Date().getFullYear()} Autoofy</span>
            <span>Proefrit Beheer Systeem</span>
          </div>
        </footer>

        {/* Bottom Navigation for mobile */}
        <BottomNav />
      </div>
    </div>
  )
}

