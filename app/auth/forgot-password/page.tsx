"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { Mail, ArrowLeft, CheckCircle, ChevronRight, Shield, Clock, Send } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-autoofy-red/5 to-transparent rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Terug naar inloggen
        </Link>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
          <div className="p-8 lg:p-10">
            {!success ? (
              <>
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-autoofy-red/10 to-red-100 rounded-2xl">
                    <Mail className="w-10 h-10 text-autoofy-red" />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Wachtwoord vergeten?
                  </h1>
                  <p className="text-gray-600">
                    Geen zorgen! We sturen u een link om uw wachtwoord te resetten.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Bezig met verzenden...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Verstuur reset link
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Security Info */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Veilig & Beveiligd</p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Reset links zijn 1 uur geldig en kunnen maar 1x gebruikt worden
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Binnen enkele minuten</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Check ook je spam folder als je de email niet ziet
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full animate-bounce">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Email verzonden!
                  </h2>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Als dit e-mailadres bij ons geregistreerd is, ontvangt u binnen enkele minuten een e-mail met instructies.
                  </p>
                </div>

                {/* Email Address */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Email verzonden naar:</p>
                  <p className="font-semibold text-gray-900">{email}</p>
                </div>

                {/* Instructions */}
                <div className="space-y-3 pt-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-left">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Wat nu?
                    </h3>
                    <ol className="text-sm text-blue-800 space-y-2 ml-6 list-decimal">
                      <li>Check je inbox (en spam folder!)</li>
                      <li>Klik op de reset link in de email</li>
                      <li>Kies een nieuw wachtwoord</li>
                      <li>Log in met je nieuwe wachtwoord</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-left">
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Email niet ontvangen?</span>
                      <br />
                      • Check je spam/ongewenste email folder
                      <br />
                      • Wacht nog 5-10 minuten
                      <br />
                      • Zoek naar emails van <code className="bg-amber-100 px-1 rounded">support@proefrit-autoofy.nl</code>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4">
                  <Link href="/">
                    <Button className="w-full h-12 bg-gradient-to-r from-autoofy-red to-red-600 hover:from-autoofy-red/90 hover:to-red-600/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                      Terug naar inloggen
                    </Button>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail("")
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Andere email proberen
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Nog steeds problemen?{" "}
            <a href="mailto:support@proefrit-autoofy.nl" className="text-autoofy-red hover:text-red-700 font-medium transition-colors">
              Neem contact op
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
