"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

function AutoLoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get("token")
    const userId = searchParams.get("userId")
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

    if (token && userId) {
      // Attempt auto-login using EmailLink provider
      signIn("EmailLink", {
        token,
        userId,
        redirect: true,
        callbackUrl,
      })
        .then((result) => {
          // If signIn returns an error, redirect to login page
          // The email is already verified, so user can login manually
          if (result?.error) {
            console.error("Auto-login error:", result.error)
            // Email is already verified, so redirect to login with success message
            router.push("/?verified=true")
          }
        })
        .catch((error) => {
          console.error("Auto-login error:", error)
          // Email is already verified, so redirect to login with success message
          // User can now login manually with their credentials
          router.push("/?verified=true")
        })
    } else {
      router.push("/?error=invalid_token")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
        <CardHeader className="text-center pb-8 bg-autoofy-dark rounded-t-xl">
          <div className="flex justify-center mb-6">
            <div className="relative bg-white/10 p-4 rounded-lg">
              <Image
                src="/autoofy-logo.svg"
                alt="Autoofy Logo"
                width={152}
                height={17}
                className="object-contain h-12 w-auto"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white">
            Inloggen...
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-autoofy-red"></div>
            </div>
            <p className="text-muted-foreground">
              U wordt automatisch ingelogd...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AutoLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autoofy-red"></div>
      </div>
    }>
      <AutoLoginForm />
    </Suspense>
  )
}

