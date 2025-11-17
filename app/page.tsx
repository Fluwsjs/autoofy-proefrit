"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator"
import Image from "next/image"
import { CheckCircle, Mail, Lock, Building2, User, Eye, EyeOff, ArrowRight, Sparkles, ExternalLink, Globe } from "lucide-react"

function HomePageForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    // Check if user was redirected after email verification
    const verified = searchParams.get("verified")
    const email = searchParams.get("email")
    
    if (verified === "true") {
      setSuccessMessage("Uw e-mailadres is geverifieerd! U kunt nu inloggen.")
      setIsLogin(true)
      if (email) {
        setLoginData(prev => ({ ...prev, email: decodeURIComponent(email) }))
      }
      // Clear URL parameters
      router.replace("/", { scroll: false })
    }
  }, [searchParams, router])

  const [registerData, setRegisterData] = useState({
    tenantName: "",
    userName: "",
    email: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", { email: loginData.email, passwordLength: loginData.password.length })
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })
      console.log("SignIn result:", { ok: result?.ok, error: result?.error })

      if (result?.error) {
        console.error("Login error:", result.error)
        // Check if error message contains email verification hint
        if (result.error.includes("verifieerd")) {
          setError(result.error)
        } else {
          setError(result.error || "Ongeldige inloggegevens")
        }
      } else {
        console.log("Login successful, redirecting...")
        // Check if user is super admin and redirect accordingly
        // We need to wait a bit for the session to update
        setTimeout(() => {
          // This will be handled by the dashboard layout which checks for super admin
          router.push("/dashboard")
        }, 100)
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      }).catch((fetchError) => {
        console.error("Fetch error:", fetchError)
        throw new Error("Kan niet verbinden met de server. Controleer of de development server draait (npm run dev).")
      })

      const data = await response.json()

      if (!response.ok) {
        // Show specific error message from server
        const errorMessage = data.error || `Er is een fout opgetreden (${response.status})`
        setError(errorMessage)
        console.error("Registration error:", data)
        return
      } else {
        // Registration successful - show success message
        // User needs to verify email before logging in
        if (data.requiresVerification) {
          // Pass email to verify-email page for resend functionality
          const emailParam = data.email ? `?email=${encodeURIComponent(data.email)}` : ""
          router.push(`/auth/verify-email${emailParam}`)
        } else {
          // Auto login after registration (fallback for old accounts)
          const result = await signIn("credentials", {
            email: registerData.email,
            password: registerData.password,
            redirect: false,
          })

          if (result?.ok) {
            router.push("/dashboard")
          }
        }
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden bij het registreren")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-4 relative overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-autoofy-red/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-autoofy-dark/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        {/* Animated gradient header */}
        <CardHeader className={`text-center pb-8 bg-gradient-to-br ${isLogin ? 'from-autoofy-dark to-autoofy-dark/90' : 'from-autoofy-red to-autoofy-red/90'} rounded-t-xl transition-all duration-500 relative overflow-hidden`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/30 transform transition-transform duration-300 hover:scale-105">
                <Image
                  src="/autoofy-logo.svg"
                  alt="Autoofy Logo"
                  width={152}
                  height={17}
                  className="object-contain h-12 w-auto"
                  priority
                />
                {!isLogin && (
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {isLogin ? "Welkom terug" : "Aanmelden"}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg mt-2 text-white/95">
              {isLogin
                ? "Log in op uw account om verder te gaan"
                : "Maak een nieuw autobedrijf aan en begin direct"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {successMessage && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 font-medium">{successMessage}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <FormInput
                    label="E-mailadres"
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="pl-10"
                    placeholder="naam@voorbeeld.nl"
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <FormInput
                    label="Wachtwoord"
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-4">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-autoofy-red to-autoofy-red/90 text-white hover:from-autoofy-red/90 hover:to-autoofy-red shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-12 text-base font-semibold" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Inloggen...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Inloggen
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              
              <div className="space-y-3 text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Nog geen account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-autoofy-dark hover:text-autoofy-red hover:underline font-semibold transition-colors"
                  >
                    Registreren
                  </button>
                </p>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-autoofy-dark hover:text-autoofy-red hover:underline font-medium block transition-colors"
                >
                  Wachtwoord vergeten?
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Registration Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Registratie voortgang</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {[
                      registerData.tenantName,
                      registerData.userName,
                      registerData.email,
                      registerData.password && registerData.password.length >= 8
                    ].filter(Boolean).length}/4
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-autoofy-red to-autoofy-red/80 transition-all duration-500 rounded-full"
                    style={{ 
                      width: `${([
                        registerData.tenantName,
                        registerData.userName,
                        registerData.email,
                        registerData.password && registerData.password.length >= 8
                      ].filter(Boolean).length / 4) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <FormInput
                    label="Bedrijfsnaam"
                    value={registerData.tenantName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        tenantName: e.target.value,
                      })
                    }
                    className="pl-10"
                    placeholder="Bijv. Auto Dealer BV"
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <FormInput
                    label="Uw naam"
                    value={registerData.userName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        userName: e.target.value,
                      })
                    }
                    className="pl-10"
                    placeholder="Voornaam Achternaam"
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <FormInput
                    label="E-mailadres"
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className="pl-10"
                    placeholder="naam@voorbeeld.nl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </div>
                    <FormInput
                      label="Wachtwoord"
                      type="password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      className="pl-10"
                      placeholder="Minimaal 8 tekens"
                      required
                      minLength={8}
                    />
                  </div>
                  {registerData.password && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <PasswordStrengthIndicator password={registerData.password} />
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-4">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-autoofy-red to-autoofy-red/90 text-white hover:from-autoofy-red/90 hover:to-autoofy-red shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-12 text-base font-semibold" 
                disabled={loading || !registerData.tenantName || !registerData.userName || !registerData.email || !registerData.password}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Registreren...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Account aanmaken
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground pt-2">
                Al een account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-autoofy-dark hover:text-autoofy-red hover:underline font-semibold transition-colors"
                >
                  Inloggen
                </button>
              </p>
            </form>
          )}
        </CardContent>
        
        {/* Autoofy Footer Link */}
        <div className="border-t bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <a 
              href="https://www.autoofy.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-autoofy-dark hover:text-autoofy-red font-semibold transition-colors group"
            >
              <span>Autoofy</span>
              <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autoofy-red"></div>
      </div>
    }>
      <HomePageForm />
    </Suspense>
  )
}

