"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { Mail, ArrowLeft, CheckCircle, ChevronRight } from "lucide-react"
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
                      E-mail verzonden!
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Als dit e-mailadres bij ons geregistreerd is, ontvangt u een e-mail met instructies om uw wachtwoord te resetten.
                    </p>
                    <div className="pt-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Controleer ook uw spam folder als u de e-mail niet ziet.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Link href="/" className="block">
                      <Button className="w-full bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <span className="flex items-center gap-2">
                          Terug naar inloggen
                          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
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
                      Wachtwoord vergeten?
                    </h2>
                    <p className="text-gray-600">
                      Geen zorgen, we sturen u instructies om uw wachtwoord te resetten
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
                    <FormInput
                      label="E-mailadres"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      icon={<Mail className="w-5 h-5" />}
                      placeholder="uw@email.nl"
                      autoComplete="email"
                    />

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Bezig met verzenden...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Verstuur reset link
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
