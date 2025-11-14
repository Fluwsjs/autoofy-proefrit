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
import { CheckCircle } from "lucide-react"

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
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      })

      if (result?.error) {
        // Check if error message contains email verification hint
        if (result.error.includes("verifieerd")) {
          setError(result.error)
        } else {
          setError("Ongeldige inloggegevens")
        }
      } else {
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
          router.push("/auth/verify-email")
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background decoration - Autoofy stijl */}
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
            {isLogin ? "Welkom terug" : "Aanmelden"}
          </CardTitle>
          <CardDescription className="text-base mt-2 text-white/90">
            {isLogin
              ? "Log in op uw account om verder te gaan"
              : "Maak een nieuw autobedrijf aan en begin direct"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {successMessage && (
                <div className="p-3 rounded-md bg-green-50 border border-green-200 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}
              <FormInput
                label="E-mailadres"
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
              />
              <FormInput
                label="Wachtwoord"
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90 shadow-lg transition-all duration-300 hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? "Inloggen..." : "Inloggen"}
              </Button>
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Nog geen account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-autoofy-dark hover:text-autoofy-red hover:underline font-medium"
                  >
                    Registreren
                  </button>
                </p>
                <Link href="/auth/forgot-password" className="text-sm text-autoofy-dark hover:text-autoofy-red hover:underline font-medium block">
                  Wachtwoord vergeten?
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <FormInput
                label="Bedrijfsnaam"
                value={registerData.tenantName}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    tenantName: e.target.value,
                  })
                }
                required
              />
              <FormInput
                label="Uw naam"
                value={registerData.userName}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    userName: e.target.value,
                  })
                }
                required
              />
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
                required
              />
              <div className="space-y-2">
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
                  required
                  minLength={8}
                />
                {registerData.password && (
                  <PasswordStrengthIndicator password={registerData.password} />
                )}
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-autoofy-red text-white hover:bg-autoofy-red/90 shadow-lg transition-all duration-300 hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? "Registreren..." : "Registreren"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Al een account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-autoofy-dark hover:text-autoofy-red hover:underline font-medium"
                >
                  Inloggen
                </button>
              </p>
            </form>
          )}
        </CardContent>
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

