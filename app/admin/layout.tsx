import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/Navbar"
import { ExternalLink } from "lucide-react"

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Autoofy. Alle rechten voorbehouden.</span>
            </div>
            <a 
              href="https://www.autoofy.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-autoofy-dark hover:text-autoofy-red font-medium transition-colors group"
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

