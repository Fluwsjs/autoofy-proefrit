"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { Lock, CheckCircle, ArrowLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-autoofy-red/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Image 
              src="/autoofy-logo.svg" 
              alt="Autoofy" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-white">Autoofy</h1>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
            <div className="p-8">
              {success ? (
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                      <div className="relative p-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-xl">
                        <CheckCircle className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-autoofy-dark">
                      Wachtwoord gereset!
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Uw wachtwoord is succesvol gewijzigd. U kunt nu inloggen met uw nieuwe wachtwoord.
                    </p>
                    <div className="pt-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm text-blue-800">
                        🔒 U wordt over 3 seconden automatisch doorgestuurd...
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Link href="/" className="block">
                      <Button className="w-full bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <span className="flex items-center gap-2">
                          Naar inloggen
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-autoofy-dark">
                      Nieuw wachtwoord
                    </h2>
                    <p className="text-gray-600">
                      Kies een sterk nieuw wachtwoord voor uw account
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-in slide-in-from-left-4">
                      <p className="text-red-800 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <div className="relative">
                        <FormInput
                          label="Nieuw wachtwoord"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          icon={<Lock className="w-5 h-5" />}
                          placeholder="Minimaal 8 tekens"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {password && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium">Wachtwoord sterkte:</span>
                            <span className={`font-semibold ${
                              passwordStrength >= 3 ? 'text-green-600' : 
                              passwordStrength === 2 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {getPasswordStrengthLabel()}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            />
                          </div>
                          <ul className="text-xs space-y-1.5 mt-3 bg-gray-50 p-3 rounded-lg">
                            <li className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-600 font-medium" : "text-gray-500"}`}>
                              <span className="text-base">{password.length >= 8 ? "✓" : "○"}</span>
                              Minimaal 8 tekens
                            </li>
                            <li className={`flex items-center gap-2 ${password.match(/[a-z]/) && password.match(/[A-Z]/) ? "text-green-600 font-medium" : "text-gray-500"}`}>
                              <span className="text-base">{password.match(/[a-z]/) && password.match(/[A-Z]/) ? "✓" : "○"}</span>
                              Hoofdletters en kleine letters
                            </li>
                            <li className={`flex items-center gap-2 ${password.match(/\d/) ? "text-green-600 font-medium" : "text-gray-500"}`}>
                              <span className="text-base">{password.match(/\d/) ? "✓" : "○"}</span>
                              Minimaal één cijfer
                            </li>
                            <li className={`flex items-center gap-2 ${password.match(/[^a-zA-Z\d]/) ? "text-green-600 font-medium" : "text-gray-500"}`}>
                              <span className="text-base">{password.match(/[^a-zA-Z\d]/) ? "✓" : "○"}</span>
                              Minimaal één speciaal teken
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <FormInput
                        label="Bevestig wachtwoord"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        icon={<Lock className="w-5 h-5" />}
                        placeholder="Herhaal wachtwoord"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-600 mt-1.5 font-medium">❌ Wachtwoorden komen niet overeen</p>
                      )}
                      {confirmPassword && password === confirmPassword && password.length >= 8 && (
                        <p className="text-xs text-green-600 mt-1.5 font-medium">✓ Wachtwoorden komen overeen</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !token}
                      className="w-full bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Wachtwoord resetten...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-5 h-5" />
                          Wachtwoord resetten
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>

                    <Link href="/" className="block">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full hover:bg-gray-100 transition-colors group"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Terug naar inloggen
                      </Button>
                    </Link>
                  </form>
                </div>
              )}
            </div>
          </Card>

          {/* Footer Link */}
          <div className="text-center mt-6">
            <Link 
              href="https://autoofy.nl" 
              target="_blank"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
            >
              <span>Meer info op Autoofy.nl</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
