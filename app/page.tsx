"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator"
import Image from "next/image"
import { 
  Mail, Lock, Building2, User, ArrowRight, Car, Clock, FileCheck, 
  ChevronRight, CheckCircle2, BarChart3, Shield, Zap, Users,
  ChevronLeft, Eye, EyeOff, Sparkles
} from "lucide-react"

function HomePageForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [registerStep, setRegisterStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    tenantName: "",
    userName: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    const verified = searchParams.get("verified")
    const email = searchParams.get("email")
    
    if (verified === "true") {
      setSuccessMessage("Uw e-mailadres is geverifieerd! U kunt nu inloggen.")
      setIsLogin(true)
      if (email) {
        setLoginData(prev => ({ ...prev, email: decodeURIComponent(email) }))
      }
      router.replace("/", { scroll: false })
    }
  }, [searchParams, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Ongeldige inloggegevens. Controleer uw e-mailadres en wachtwoord.")
        } else {
          setError(result.error || "Ongeldige inloggegevens")
        }
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterNext = () => {
    if (registerStep === 1) {
      if (!registerData.tenantName || !registerData.userName) {
        setError("Vul alle velden in om door te gaan")
        return
      }
    }
    setError("")
    setRegisterStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        setSuccessMessage("Account succesvol aangemaakt! Controleer uw e-mail om uw account te activeren.")
        setRegisterData({
          tenantName: "",
          userName: "",
          email: "",
          password: "",
        })
        setRegisterStep(1)
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-autoofy-red to-red-600 p-2 rounded-xl shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-autoofy-red to-red-600 bg-clip-text text-transparent">
                Autoofy
              </h1>
              <p className="text-xs text-gray-600">Proefrit Beheer</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left Side - Hero Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
              <Sparkles className="w-4 h-4 text-autoofy-red" />
              <span className="text-sm font-medium text-gray-700">Professioneel Proefrit Beheer</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Proefritten
                </span>
                <br />
                <span className="bg-gradient-to-r from-autoofy-red via-red-600 to-red-700 bg-clip-text text-transparent">
                  Digitaal Geregeld
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-xl">
                De moderne oplossing voor het professioneel beheren van proefritten in uw autobedrijf.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Realtime Tracking</h3>
                  <p className="text-sm text-gray-600">Volg alle proefritten live</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Digitale Handtekening</h3>
                  <p className="text-sm text-gray-600">Juridisch bindend</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Veilig & Beveiligd</h3>
                  <p className="text-sm text-gray-600">ID verificatie & beveiligde data</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Inzicht in data</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-semibold text-sm">
                  JH
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-semibold text-sm">
                  MB
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-semibold text-sm">
                  PV
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-semibold text-sm">
                  +5
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Vertrouwd door dealers</p>
                <p className="text-xs text-gray-600">En steeds meer</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
              {/* Tabs */}
              <div className="grid grid-cols-2 p-1 bg-gray-100/80 rounded-t-xl">
                <button
                  onClick={() => {
                    setIsLogin(true)
                    setError("")
                    setSuccessMessage("")
                  }}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    isLogin
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Inloggen
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false)
                    setError("")
                    setSuccessMessage("")
                    setRegisterStep(1)
                  }}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    !isLogin
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Registreren
                </button>
              </div>

              <div className="p-8">
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 font-medium">{successMessage}</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* Login Form */}
                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">Welkom terug</h2>
                      <p className="text-sm text-gray-600">Log in om verder te gaan</p>
                    </div>

                    <FormInput
                      label="E-mailadres"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      icon={<Mail className="w-5 h-5" />}
                      placeholder="uw@email.nl"
                      autoComplete="email"
                    />

                    <div className="relative">
                      <FormInput
                        label="Wachtwoord"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        icon={<Lock className="w-5 h-5" />}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-autoofy-red focus:ring-autoofy-red transition-all" 
                        />
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                          Onthoud mij
                        </span>
                      </label>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-autoofy-red hover:text-red-700 font-medium transition-colors"
                      >
                        Wachtwoord vergeten?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Bezig met inloggen...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Inloggen
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  /* Register Form */
                  registerStep === 1 ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleRegisterNext(); }} className="space-y-5">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Account aanmaken</h2>
                        <p className="text-sm text-gray-600">Start binnen 2 minuten</p>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-autoofy-red rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                      </div>
                      <p className="text-xs text-gray-600 text-center">Stap 1 van 2</p>

                      <FormInput
                        label="Bedrijfsnaam"
                        type="text"
                        value={registerData.tenantName}
                        onChange={(e) => setRegisterData({ ...registerData, tenantName: e.target.value })}
                        required
                        icon={<Building2 className="w-5 h-5" />}
                        placeholder="Uw Autobedrijf BV"
                        autoComplete="organization"
                      />

                      <FormInput
                        label="Uw naam"
                        type="text"
                        value={registerData.userName}
                        onChange={(e) => setRegisterData({ ...registerData, userName: e.target.value })}
                        required
                        icon={<User className="w-5 h-5" />}
                        placeholder="Jan de Vries"
                        autoComplete="name"
                      />

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <span className="flex items-center gap-2">
                          Volgende
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-5">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRegisterStep(1)
                            setError("")
                          }}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Terug
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">Account gegevens</h2>
                        <p className="text-sm text-gray-600">Bijna klaar!</p>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-autoofy-red rounded-full"></div>
                        <div className="flex-1 h-2 bg-autoofy-red rounded-full"></div>
                      </div>
                      <p className="text-xs text-gray-600 text-center">Stap 2 van 2</p>

                      <FormInput
                        label="E-mailadres"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        icon={<Mail className="w-5 h-5" />}
                        placeholder="uw@email.nl"
                        autoComplete="email"
                      />

                      <div className="relative">
                        <FormInput
                          label="Wachtwoord"
                          type={showPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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

                      <PasswordStrengthIndicator password={registerData.password} />

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Account aanmaken...
                          </span>
                        ) : (
                          "Account aanmaken"
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Door te registreren gaat u akkoord met onze{" "}
                        <a href="#" className="text-autoofy-red hover:underline">Voorwaarden</a>
                        {" "}en{" "}
                        <a href="#" className="text-autoofy-red hover:underline">Privacybeleid</a>
                      </p>
                    </form>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-autoofy-red/5 to-transparent rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl -z-10"></div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-autoofy-red"></div>
      </div>
    }>
      <HomePageForm />
    </Suspense>
  )
}
