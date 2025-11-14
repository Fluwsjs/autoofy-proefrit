"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { Lock, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Geen reset token gevonden")
    }
  }, [searchParams])

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++
    if (pwd.match(/\d/)) strength++
    if (pwd.match(/[^a-zA-Z\d]/)) strength++
    return strength
  }

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "Zeer zwak"
    if (passwordStrength === 1) return "Zwak"
    if (passwordStrength === 2) return "Redelijk"
    if (passwordStrength === 3) return "Goed"
    return "Sterk"
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen")
      setLoading(false)
      return
    }

    if (passwordStrength < 2) {
      setError("Wachtwoord is niet sterk genoeg. Gebruik minimaal 8 tekens met hoofdletters, cijfers en speciale tekens.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autoofy-red"></div>
      </div>
    )
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
            Nieuw wachtwoord instellen
          </CardTitle>
          <CardDescription className="text-base mt-2 text-white/90">
            Kies een sterk nieuw wachtwoord voor uw account
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
                  Wachtwoord gereset!
                </h2>
                <p className="text-muted-foreground">
                  Uw wachtwoord is succesvol gewijzigd. U wordt doorgestuurd naar de inlogpagina...
                </p>
              </div>
              <Link href="/">
                <Button className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90">
                  Naar inloggen
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <FormInput
                  label="Nieuw wachtwoord"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Wachtwoord sterkte:</span>
                      <span className={`font-medium ${passwordStrength >= 3 ? 'text-green-600' : passwordStrength === 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                      <li className={password.length >= 8 ? "text-green-600" : ""}>
                        {password.length >= 8 ? "✓" : "•"} Minimaal 8 tekens
                      </li>
                      <li className={password.match(/[a-z]/) && password.match(/[A-Z]/) ? "text-green-600" : ""}>
                        {password.match(/[a-z]/) && password.match(/[A-Z]/) ? "✓" : "•"} Hoofdletters en kleine letters
                      </li>
                      <li className={password.match(/\d/) ? "text-green-600" : ""}>
                        {password.match(/\d/) ? "✓" : "•"} Minimaal één cijfer
                      </li>
                      <li className={password.match(/[^a-zA-Z\d]/) ? "text-green-600" : ""}>
                        {password.match(/[^a-zA-Z\d]/) ? "✓" : "•"} Minimaal één speciaal teken
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <FormInput
                  label="Bevestig wachtwoord"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Wachtwoorden komen niet overeen</p>
                )}
              </div>
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                disabled={loading || !token}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Wachtwoord resetten...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Wachtwoord resetten
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autoofy-red"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

