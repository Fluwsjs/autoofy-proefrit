"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(null)
  const [errorType, setErrorType] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    const success = searchParams.get("success")

    if (success === "true") {
      setStatus("success")
    } else if (error) {
      setStatus("error")
      setErrorType(error)
    } else {
      setStatus(null)
    }
  }, [searchParams])

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
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Terug naar inloggen
                  </Button>
                </Link>
                {errorType === "expired_token" && (
                  <p className="text-sm text-muted-foreground">
                    Neem contact op met support voor een nieuwe verificatie e-mail.
                  </p>
                )}
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

