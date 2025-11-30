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

    console.log("[AUTO-LOGIN] Starting auto-login process")
    console.log("[AUTO-LOGIN] Token:", token?.substring(0, 20) + "...")
    console.log("[AUTO-LOGIN] UserId:", userId)
    console.log("[AUTO-LOGIN] CallbackUrl:", callbackUrl)

    if (token && userId) {
      // Attempt auto-login using email-link provider
      console.log("[AUTO-LOGIN] Calling signIn with email-link provider...")
      signIn("email-link", {
        token,
        userId,
        redirect: false, // Changed to false to see the result
        callbackUrl,
      })
        .then((result) => {
          console.log("[AUTO-LOGIN] SignIn result:", result)
          
          // If signIn was successful, manually redirect
          if (result?.ok && !result?.error) {
            console.log("[AUTO-LOGIN] ✅ Success! Redirecting to:", callbackUrl)
            router.push(callbackUrl)
          } else {
            // If signIn returns an error, redirect to login page
            // The email is already verified, so user can login manually
            console.error("[AUTO-LOGIN] ❌ SignIn failed with error:", result?.error)
            console.error("[AUTO-LOGIN] Result status:", result?.status)
            console.error("[AUTO-LOGIN] Result URL:", result?.url)
            // Email is already verified, so redirect to login with success message
            router.push("/?verified=true&message=" + encodeURIComponent("Uw email is geverifieerd! U kunt nu inloggen."))
          }
        })
        .catch((error) => {
          console.error("[AUTO-LOGIN] ❌ Exception during signIn:", error)
          // Email is already verified, so redirect to login with success message
          // User can now login manually with their credentials
          router.push("/?verified=true&message=" + encodeURIComponent("Uw email is geverifieerd! U kunt nu inloggen."))
        })
    } else {
      console.error("[AUTO-LOGIN] ❌ Missing token or userId")
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

