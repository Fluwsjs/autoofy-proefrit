"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirect to main admin page - users are now integrated there
export default function AdminUsersPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/admin")
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="space-y-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="text-slate-400">Doorsturen naar Admin Dashboard...</p>
      </div>
    </div>
  )
}
