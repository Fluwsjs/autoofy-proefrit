"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Mail, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(null)
  const [errorType, setErrorType] = useState<string | null>(null)
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState("")
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    const error = searchParams.get("error")
    const success = searchParams.get("success")
    const emailParam = searchParams.get("email")

    if (emailParam) {
      setEmail(emailParam)
    }

    if (success === "true") {
      setStatus("success")
      
      // Redirect to login page after 2 seconds with success message and email pre-filled
      if (emailParam && !autoLoginAttempted) {
        setAutoLoginAttempted(true)
        setTimeout(() => {
          router.push(`/?verified=true&email=${encodeURIComponent(emailParam)}`)
        }, 2000)
      }
    } else if (error) {
      setStatus("error")
      setErrorType(error)
    } else {
      setStatus(null)
    }
  }, [searchParams, autoLoginAttempted, router])

  const handleResendEmail = async () => {
    if (!email) {
      setResendError("E-mailadres is vereist")
      return
    }

    setResendLoading(true)
    setResendError("")
    setResendSuccess(false)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResendError(data.error || "Er is een fout opgetreden")
      } else {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (err) {
      setResendError("Er is een fout opgetreden bij het verzenden")
    } finally {
      setResendLoading(false)
    }
  }

  const getErrorMessage = () => {
    switch (errorType) {
      case "invalid_token":
        return "De verificatielink is ongeldig. Controleer of u de volledige link heeft gebruikt."
      case "expired_token":
        return "De verificatielink is verlopen. Vraag een nieuwe verificatie e-mail aan."
      case "server_error":
        return "Er is een fout opgetreden. Probeer het later opnieuw."
      default:
        return "Er is een fout opgetreden bij de verificatie."
    }
  }

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
            E-mail Verificatie
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          {status === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-autoofy-dark">
                  E-mail geverifieerd!
                </h2>
                <p className="text-muted-foreground">
                  Uw e-mailadres is succesvol geverifieerd. U kunt nu inloggen op uw account.
                </p>
              </div>
              <Link href="/">
                <Button className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90">
                  Ga naar inloggen
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-red-100">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-autoofy-dark">
                  Verificatie mislukt
                </h2>
                <p className="text-muted-foreground">
                  {getErrorMessage()}
                </p>
              </div>
              <div className="space-y-3">
                {(errorType === "expired_token" || errorType === "invalid_token") && (
                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">
                      Nieuwe verificatie e-mail ontvangen?
                    </p>
                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="Uw e-mailadres"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-autoofy-red focus:border-transparent"
                      />
                      {resendError && (
                        <p className="text-sm text-red-600">{resendError}</p>
                      )}
                      {resendSuccess && (
                        <p className="text-sm text-green-600">
                          ✅ Verificatie e-mail opnieuw verzonden! Controleer uw inbox.
                        </p>
                      )}
                      <Button
                        onClick={handleResendEmail}
                        disabled={resendLoading || !email}
                        className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90"
                      >
                        {resendLoading ? "Verzenden..." : "Verstuur nieuwe verificatie e-mail"}
                      </Button>
                    </div>
                  </div>
                )}
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Terug naar inloggen
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === null && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-blue-100">
                  <Mail className="h-12 w-12 text-autoofy-dark" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-autoofy-dark">
                  Controleer uw e-mail
                </h2>
                <p className="text-muted-foreground">
                  We hebben een verificatie e-mail naar uw e-mailadres gestuurd. 
                  Klik op de link in de e-mail om uw account te activeren.
                </p>
              </div>
              <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">
                  Geen e-mail ontvangen?
                </p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Uw e-mailadres"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-autoofy-red focus:border-transparent"
                  />
                  {resendError && (
                    <p className="text-sm text-red-600">{resendError}</p>
                  )}
                  {resendSuccess && (
                    <p className="text-sm text-green-600">
                      ✅ Verificatie e-mail opnieuw verzonden! Controleer uw inbox.
                    </p>
                  )}
                  <Button
                    onClick={handleResendEmail}
                    disabled={resendLoading || !email}
                    variant="outline"
                    className="w-full"
                  >
                    {resendLoading ? "Verzenden..." : "Verstuur opnieuw"}
                  </Button>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Terug naar inloggen
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autoofy-red"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}

