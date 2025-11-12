"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
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
        setError("Ongeldige inloggegevens")
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
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        // Auto login after registration
        const result = await signIn("credentials", {
          email: registerData.email,
          password: registerData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Background decoration - Autoofy stijl */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-autoofy-light/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-autoofy-dark/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white">
        <CardHeader className="text-center pb-8 bg-autoofy-dark rounded-t-xl">
          <div className="flex justify-center mb-6">
            <div className="relative bg-white/10 p-4 rounded-lg">
              <Image
                src="/autoofy.png"
                alt="Autoofy Logo"
                width={150}
                height={50}
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
                className="w-full bg-autoofy-dark text-white hover:bg-autoofy-dark/90 shadow-lg transition-all duration-300 hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? "Inloggen..." : "Inloggen"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Nog geen account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-autoofy-dark hover:text-autoofy-light hover:underline font-medium"
                >
                  Registreren
                </button>
              </p>
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
                minLength={6}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-autoofy-dark text-white hover:bg-autoofy-dark/90 shadow-lg transition-all duration-300 hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? "Registreren..." : "Registreren"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Al een account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-autoofy-dark hover:text-autoofy-light hover:underline font-medium"
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

