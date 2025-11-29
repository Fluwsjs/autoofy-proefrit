"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { Lock, CheckCircle, ArrowLeft, ChevronRight, Eye, EyeOff, Shield, AlertCircle, Key } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    if (passwordStrength === 2) return "bg-amber-500"
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
      setError("Wachtwoord is niet sterk genoeg")
      setLoading(false)
      return
    }

    if (!token) {
      setError("Geen geldig reset token")
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
          router.push("/?reset=success")
        }, 3000)
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-autoofy-red/5 to-transparent rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Back Button */}
        {!success && (
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Terug naar inloggen
          </Link>
        )}

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
          <div className="p-8 lg:p-10">
            {!success ? (
              <>
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-autoofy-red/10 to-red-100 rounded-2xl">
                    <Key className="w-10 h-10 text-autoofy-red" />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Nieuw wachtwoord instellen
                  </h1>
                  <p className="text-gray-600">
                    Kies een sterk wachtwoord om uw account te beveiligen
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <FormInput
                      label="Nieuw wachtwoord"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      icon={<Lock className="w-5 h-5" />}
                      placeholder="Minimaal 8 tekens"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Wachtwoord sterkte:</span>
                        <span className={`font-semibold ${
                          passwordStrength <= 1 ? "text-red-600" :
                          passwordStrength === 2 ? "text-amber-600" :
                          passwordStrength === 3 ? "text-blue-600" :
                          "text-green-600"
                        }`}>
                          {getPasswordStrengthLabel()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              i < passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Requirements */}
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Vereisten:</p>
                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 text-xs ${password.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? "bg-green-600" : "bg-gray-300"}`} />
                            Minimaal 8 tekens
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${password.match(/[a-z]/) && password.match(/[A-Z]/) ? "text-green-600" : "text-gray-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${password.match(/[a-z]/) && password.match(/[A-Z]/) ? "bg-green-600" : "bg-gray-300"}`} />
                            Hoofdletters en kleine letters
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${password.match(/\d/) ? "text-green-600" : "text-gray-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${password.match(/\d/) ? "bg-green-600" : "bg-gray-300"}`} />
                            Minimaal één cijfer
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${password.match(/[^a-zA-Z\d]/) ? "text-green-600" : "text-gray-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${password.match(/[^a-zA-Z\d]/) ? "bg-green-600" : "bg-gray-300"}`} />
                            Minimaal één speciaal teken
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <FormInput
                      label="Bevestig wachtwoord"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      icon={<Lock className="w-5 h-5" />}
                      placeholder="Herhaal uw wachtwoord"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Match Indicator */}
                  {confirmPassword && (
                    <div className={`flex items-center gap-2 text-sm ${
                      password === confirmPassword ? "text-green-600" : "text-red-600"
                    }`}>
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Wachtwoorden komen overeen
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Wachtwoorden komen niet overeen
                        </>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || passwordStrength < 2 || password !== confirmPassword}
                    className="w-full h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Wachtwoord resetten...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Wachtwoord opslaan
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Security Info */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Veilig & Beveiligd</p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Uw wachtwoord wordt veilig versleuteld opgeslagen
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center space-y-6 py-4">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-bounce">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Wachtwoord gereset!
                  </h2>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Uw wachtwoord is succesvol gewijzigd. U kunt nu inloggen met uw nieuwe wachtwoord.
                  </p>
                </div>

                {/* Success Info */}
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-green-900">Wat nu?</p>
                      <p className="text-xs text-green-700 mt-1">
                        U wordt automatisch doorgestuurd naar de inlogpagina...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Link */}
                <Link href="/">
                  <Button className="w-full h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    Ga naar inlogpagina
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Help Link */}
        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nog steeds problemen?{" "}
              <a href="mailto:support@proefrit-autoofy.nl" className="text-autoofy-red hover:text-red-700 font-medium transition-colors">
                Neem contact op
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-autoofy-red"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
