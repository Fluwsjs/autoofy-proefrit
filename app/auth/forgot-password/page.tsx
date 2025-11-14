"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-autoofy-red/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-autoofy-dark/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white">
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
            Wachtwoord vergeten?
          </CardTitle>
          <CardDescription className="text-base mt-2 text-white/90">
            Vul uw e-mailadres in om een reset link te ontvangen
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          {success ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-autoofy-dark">
                  E-mail verzonden!
                </h2>
                <p className="text-muted-foreground">
                  Als dit e-mailadres bij ons geregistreerd is, ontvangt u een e-mail met instructies om uw wachtwoord te resetten.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Controleer ook uw spam folder als u de e-mail niet ziet.
                </p>
              </div>
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90">
                    Terug naar inloggen
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <FormInput
                  label="E-mailadres"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="uw@email.nl"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Verzenden...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Verstuur reset link
                  </>
                )}
              </Button>
              <Link href="/">
                <Button type="button" variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Terug naar inloggen
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

