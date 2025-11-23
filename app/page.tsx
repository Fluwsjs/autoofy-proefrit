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
  ChevronRight, CheckCircle2, BarChart3,
  ChevronLeft, Eye, EyeOff
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
        return
      }

      setSuccessMessage("🎉 Account succesvol aangemaakt! U wordt nu ingelogd...")
      
      // Auto login after successful registration
      setTimeout(async () => {
        const result = await signIn("credentials", {
          email: registerData.email,
          password: registerData.password,
          redirect: false,
        })
        
        if (result?.ok) {
          router.push("/dashboard")
        } else {
          setIsLogin(true)
          setLoginData(prev => ({ ...prev, email: registerData.email }))
          setSuccessMessage("Account aangemaakt! Log nu in.")
        }
      }, 1500)

    } catch (err) {
      setError("Er is een fout opgetreden bij het aanmaken van het account")
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError("")
    setSuccessMessage("")
    setRegisterStep(1)
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 p-8 xl:p-12 flex-col justify-between bg-white border-r border-slate-200">
          {/* Logo & Title */}
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <Image 
                src="/autoofy-logo.svg" 
                alt="Autoofy" 
                width={140} 
                height={16}
                className="h-8 w-auto"
              />
            </div>

            {/* Hero Message */}
            <div className="space-y-3 max-w-lg">
              <h2 className="text-4xl font-semibold text-slate-900 leading-tight">
                Proefritten Digitaal Geregeld
              </h2>
              
              <p className="text-base text-slate-600 leading-relaxed">
                De moderne oplossing voor het professioneel beheren van proefritten in uw autobedrijf.
              </p>
            </div>

            {/* Features Grid - Compact */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <Clock className="w-5 h-5 text-blue-600 mb-2" />
                <h3 className="text-slate-900 font-medium text-sm mb-0.5">Realtime Tracking</h3>
                <p className="text-slate-600 text-xs">Volg alle proefritten live</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <FileCheck className="w-5 h-5 text-green-600 mb-2" />
                <h3 className="text-slate-900 font-medium text-sm mb-0.5">Digitale Handtekening</h3>
                <p className="text-slate-600 text-xs">Juridisch bindend</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <Car className="w-5 h-5 text-purple-600 mb-2" />
                <h3 className="text-slate-900 font-medium text-sm mb-0.5">Handelaarskenteken</h3>
                <p className="text-slate-600 text-xs">Centraal beheer</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <BarChart3 className="w-5 h-5 text-amber-600 mb-2" />
                <h3 className="text-slate-900 font-medium text-sm mb-0.5">Analytics</h3>
                <p className="text-slate-600 text-xs">Inzicht in data</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div>
            <Link 
              href="https://autoofy.nl" 
              target="_blank"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
            >
              <span>Meer informatie op Autoofy.nl</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-6">
              <Image 
                src="/autoofy-logo.svg" 
                alt="Autoofy" 
                width={120} 
                height={14}
                className="h-7 w-auto"
              />
            </div>

            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
              {/* Header with Tabs */}
              <div className="p-6 pb-0">
                <div className="flex gap-0.5 p-0.5 bg-slate-100 rounded-md mb-6 border border-slate-200">
                  <button
                    onClick={() => !loading && switchMode()}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-150 ${
                      isLogin 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Inloggen
                  </button>
                  <button
                    onClick={() => !loading && switchMode()}
                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-150 ${
                      !isLogin 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Registreren
                  </button>
                </div>

                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    {isLogin ? "Welkom terug" : "Account aanmaken"}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin 
                      ? "Log in om verder te gaan" 
                      : "Start binnen 2 minuten"}
                  </p>
                </div>

                {/* Progress Bar for Registration */}
                {!isLogin && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Stap {registerStep} van 2
                      </span>
                      <span className="text-sm text-gray-500">
                        {registerStep === 1 ? "Bedrijfsgegevens" : "Account gegevens"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-autoofy-red to-red-600 transition-all duration-500 ease-out"
                        style={{ width: `${(registerStep / 2) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              {error && (
                <div className="mx-8 mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-in slide-in-from-left-4">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mx-8 mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg animate-in slide-in-from-left-4">
                  <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {/* Forms */}
              <div className="p-8 pt-4">
                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <FormInput
                      label="E-mailadres"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      icon={<Mail className="w-5 h-5" />}
                      autoComplete="email"
                      placeholder="uw@email.nl"
                    />

                    <div className="relative">
                      <FormInput
                        label="Wachtwoord"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        icon={<Lock className="w-5 h-5" />}
                        autoComplete="current-password"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-gray-600">Onthoud mij</span>
                      </label>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-autoofy-red hover:text-autoofy-red/80 font-medium"
                      >
                        Wachtwoord vergeten?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-autoofy-red hover:bg-autoofy-red/90 text-white h-10 text-sm font-medium shadow-sm transition-all duration-150"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Bezig met inloggen...
                        </span>
                      ) : (
                        "Inloggen"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={registerStep === 1 ? (e) => { e.preventDefault(); handleRegisterNext(); } : handleRegister} className="space-y-5">
                    {registerStep === 1 ? (
                      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormInput
                          label="Bedrijfsnaam"
                          type="text"
                          value={registerData.tenantName}
                          onChange={(e) => setRegisterData({ ...registerData, tenantName: e.target.value })}
                          required
                          icon={<Building2 className="w-5 h-5" />}
                          autoComplete="organization"
                          placeholder="Uw autobedrijf"
                        />

                        <FormInput
                          label="Uw volledige naam"
                          type="text"
                          value={registerData.userName}
                          onChange={(e) => setRegisterData({ ...registerData, userName: e.target.value })}
                          required
                          icon={<User className="w-5 h-5" />}
                          autoComplete="name"
                          placeholder="Jan Jansen"
                        />

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                        >
                          <span className="flex items-center gap-2">
                            Volgende stap
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <FormInput
                          label="E-mailadres"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                          icon={<Mail className="w-5 h-5" />}
                          autoComplete="email"
                          placeholder="uw@email.nl"
                        />

                        <div>
                          <div className="relative">
                            <FormInput
                              label="Wachtwoord"
                              type={showPassword ? "text" : "password"}
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              required
                              icon={<Lock className="w-5 h-5" />}
                              autoComplete="new-password"
                              placeholder="Minimaal 8 tekens"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <PasswordStrengthIndicator password={registerData.password} />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            onClick={() => { setRegisterStep(1); setError(""); }}
                            variant="outline"
                            className="flex-1 h-12"
                          >
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Terug
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Account aanmaken...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Account aanmaken
                                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              </span>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* Terms */}
                {!isLogin && registerStep === 2 && (
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Door een account aan te maken, gaat u akkoord met onze{" "}
                    <Link href="/terms" className="text-autoofy-red hover:underline">
                      Algemene Voorwaarden
                    </Link>{" "}
                    en{" "}
                    <Link href="/privacy" className="text-autoofy-red hover:underline">
                      Privacybeleid
                    </Link>
                  </p>
                )}
              </div>
            </Card>

            {/* Mobile Back Link */}
            <div className="lg:hidden text-center mt-6">
              <Link 
                href="https://autoofy.nl" 
                target="_blank"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <span>Meer info op Autoofy.nl</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white">Laden...</p>
        </div>
      </div>
    }>
      <HomePageForm />
    </Suspense>
  )
}
