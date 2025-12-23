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
  ChevronLeft, Eye, EyeOff, Sparkles, RefreshCw, AlertCircle, Inbox, MailWarning
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

  // States for resend verification
  const [showResendForm, setShowResendForm] = useState(false)
  const [resendEmail, setResendEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

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
        // Show registration success screen with email instructions
        setRegistrationComplete(true)
        setRegisteredEmail(registerData.email)
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

  const handleResendVerification = async (emailToResend?: string) => {
    const email = emailToResend || resendEmail
    if (!email) {
      setError("Vul uw e-mailadres in")
      return
    }

    setResendLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setResendSuccess(true)
        setSuccessMessage(data.message || "Verificatie e-mail opnieuw verstuurd!")
        if (data.alreadyVerified) {
          setShowResendForm(false)
          setIsLogin(true)
          setLoginData(prev => ({ ...prev, email }))
        }
      } else {
        setError(data.error || "Er is een fout opgetreden")
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setResendLoading(false)
    }
  }

  // Reset states when switching between login/register
  const handleSwitchToLogin = () => {
    setIsLogin(true)
    setError("")
    setSuccessMessage("")
    setRegistrationComplete(false)
    setShowResendForm(false)
    setResendSuccess(false)
  }

  const handleSwitchToRegister = () => {
    setIsLogin(false)
    setError("")
    setSuccessMessage("")
    setRegisterStep(1)
    setRegistrationComplete(false)
    setShowResendForm(false)
    setResendSuccess(false)
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gradient-to-br lg:from-slate-50 lg:via-blue-50 lg:to-indigo-50">
      {/* Navigation - Desktop only */}
      <nav className="hidden lg:block absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200 group-hover:shadow-xl transition-all">
              <Image
                src="/autoofy-logo.svg"
                alt="Autoofy Logo"
                width={120}
                height={24}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-6 pb-8 sm:py-8 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left Side - Hero Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Heading - Compact on mobile */}
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Proefritten
                </span>
                <br />
                <span className="bg-gradient-to-r from-autoofy-red via-red-600 to-red-700 bg-clip-text text-transparent">
                  Digitaal Geregeld
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                De moderne oplossing voor het professioneel beheren van proefritten in uw autobedrijf.
              </p>
            </div>

            {/* Features Grid - Hidden on mobile, show after form */}
            <div className="hidden lg:grid grid-cols-2 gap-4 pt-4 max-w-2xl mx-auto lg:mx-0">
              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">Realtime Tracking</h3>
                  <p className="text-sm text-gray-600">Volg alle proefritten live</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <FileCheck className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">Digitale Handtekening</h3>
                  <p className="text-sm text-gray-600">Juridisch bindend</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">Veilig & Beveiligd</h3>
                  <p className="text-sm text-gray-600">ID verificatie & beveiligde data</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Inzicht in data</p>
                </div>
              </div>
            </div>

            {/* Social Proof - Hidden on mobile */}
            <div className="hidden lg:flex items-center justify-center lg:justify-start gap-6 pt-4">
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
            <Card className="border-0 shadow-xl lg:shadow-2xl bg-white/95 lg:bg-white/90 backdrop-blur-xl overflow-hidden ring-1 ring-gray-200 lg:ring-2 lg:ring-autoofy-red/10 rounded-2xl">
              {/* Tabs */}
              <div className="grid grid-cols-2 p-1.5 bg-gray-100/80 m-2 rounded-xl">
                <button
                  onClick={handleSwitchToLogin}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    isLogin
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Inloggen
                </button>
                <button
                  onClick={handleSwitchToRegister}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    !isLogin
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Registreren
                </button>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-green-800 font-medium">{successMessage}</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs sm:text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* Registration Complete Screen with Email Instructions */}
                {registrationComplete ? (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 mb-3 sm:mb-4">
                        <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Account aangemaakt!</h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">
                        We hebben een verificatie e-mail gestuurd naar:
                      </p>
                      <p className="font-semibold text-gray-900 mt-1 text-sm sm:text-base break-all">{registeredEmail}</p>
                    </div>

                    {/* Email Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <h3 className="font-semibold text-blue-900 flex items-center gap-2 text-sm sm:text-base">
                        <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
                        E-mail niet ontvangen?
                      </h3>
                      <ul className="text-xs sm:text-sm text-blue-800 space-y-1.5 sm:space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          <span>Check uw <strong>spam/junk folder</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          <span className="break-all">Zoek naar <code className="bg-blue-100 px-1 rounded text-[10px] sm:text-xs">support@proefrit-autoofy.nl</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                          <span>Voeg ons toe aan uw contacten</span>
                        </li>
                      </ul>
                    </div>

                    {/* Warning for custom domains */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <MailWarning className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 text-xs sm:text-sm">Zakelijk e-mailadres?</h4>
                          <p className="text-[10px] sm:text-xs text-amber-800 mt-0.5 sm:mt-1">
                            Bedrijfs-emailservers kunnen e-mails blokkeren. Controleer uw quarantaine folder.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Resend Button */}
                    <div className="pt-1 sm:pt-2">
                      {resendSuccess ? (
                        <div className="p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                          <p className="text-xs sm:text-sm text-green-800 font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Verificatie e-mail opnieuw verstuurd!
                          </p>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleResendVerification(registeredEmail)}
                          disabled={resendLoading}
                          className="w-full h-10 sm:h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all text-xs sm:text-sm"
                        >
                          {resendLoading ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                              Versturen...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              E-mail opnieuw versturen
                            </span>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Back to Login */}
                    <div className="text-center pt-1 sm:pt-2">
                      <button
                        onClick={handleSwitchToLogin}
                        className="text-xs sm:text-sm text-autoofy-red hover:text-red-700 font-medium"
                      >
                        ← Terug naar inloggen
                      </button>
                    </div>
                  </div>
                ) : isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                    <div className="space-y-1 sm:space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welkom terug</h2>
                      <p className="text-xs sm:text-sm text-gray-600">Log in om verder te gaan</p>
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

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-autoofy-red focus:ring-autoofy-red transition-all w-3.5 h-3.5 sm:w-4 sm:h-4" 
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

                    {/* Resend Verification Section */}
                    {showResendForm ? (
                      <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 sm:space-y-3">
                        <h4 className="font-semibold text-blue-900 text-xs sm:text-sm flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Verificatie e-mail opnieuw versturen
                        </h4>
                        <FormInput
                          label=""
                          type="email"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="Uw e-mailadres"
                          autoComplete="email"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => handleResendVerification()}
                            disabled={resendLoading}
                            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                          >
                            {resendLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                            ) : (
                              "Versturen"
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowResendForm(false)
                              setResendEmail("")
                              setError("")
                            }}
                            className="h-9 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm px-3"
                          >
                            Annuleren
                          </Button>
                        </div>
                        {resendSuccess && (
                          <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            E-mail verstuurd! Check ook uw spam folder.
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowResendForm(true)
                          setResendEmail(loginData.email)
                        }}
                        className="text-xs sm:text-sm text-gray-500 hover:text-autoofy-red transition-colors flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Verificatie e-mail niet ontvangen?
                      </button>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group text-sm sm:text-base"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Bezig met inloggen...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Inloggen
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  /* Register Form */
                  registerStep === 1 ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleRegisterNext(); }} className="space-y-4 sm:space-y-5">
                      <div className="space-y-1 sm:space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Account aanmaken</h2>
                        <p className="text-xs sm:text-sm text-gray-600">Start binnen 2 minuten</p>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 sm:h-2 bg-autoofy-red rounded-full"></div>
                        <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full"></div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center -mt-1">Stap 1 van 2</p>

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
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group text-sm sm:text-base"
                      >
                        <span className="flex items-center gap-2">
                          Volgende
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                      <div className="space-y-1 sm:space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRegisterStep(1)
                            setError("")
                          }}
                          className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2 sm:mb-4"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Terug
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Account gegevens</h2>
                        <p className="text-xs sm:text-sm text-gray-600">Bijna klaar!</p>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 sm:h-2 bg-autoofy-red rounded-full"></div>
                        <div className="flex-1 h-1.5 sm:h-2 bg-autoofy-red rounded-full"></div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center -mt-1">Stap 2 van 2</p>

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
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Account aanmaken...
                          </span>
                        ) : (
                          "Account aanmaken"
                        )}
                      </Button>

                      <p className="text-[10px] sm:text-xs text-gray-500 text-center leading-relaxed">
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

            {/* Mobile Features & Social Proof */}
            <div className="lg:hidden mt-6 space-y-5 pb-4">
              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Realtime tracking</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <FileCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Digitale handtekening</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">ID verificatie</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-gray-700">Analytics</span>
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold text-[9px]">
                    JH
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold text-[9px]">
                    MB
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold text-[9px]">
                    PV
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-semibold text-[9px]">
                    +5
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">Vertrouwd</span> door dealers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Desktop only */}
      <div className="hidden lg:block fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-autoofy-red/5 to-transparent rounded-full blur-3xl -z-10"></div>
      <div className="hidden lg:block fixed bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl -z-10"></div>
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
