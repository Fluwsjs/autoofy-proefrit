"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowLeft, Car, Calendar, TrendingUp, Users, ShoppingCart, Search } from "lucide-react"
import Link from "next/link"

interface Feedback {
  id: string
  purchaseLikelihood: string
  purchaseComment: string | null
  notBuyingReason: string
  notBuyingComment: string | null
  sellerContact: string
  sellerComment: string | null
  improvementArea: string
  improvementComment: string | null
  howFoundUs: string
  howFoundComment: string | null
  createdAt: string
  testride: {
    id: string
    customerName: string
    customerEmail: string
    carType: string
    date: string
    seller: {
      name: string
    } | null
  }
}

interface Stats {
  total: number
  purchaseLikelihood: Record<string, number>
  sellerContact: Record<string, number>
  howFoundUs: Record<string, number>
}

// Labels for display
const purchaseLikelihoodLabels: Record<string, string> = {
  zeer_groot: "Zeer groot",
  groot: "Groot",
  twijfel: "Twijfel",
  klein: "Klein",
  zeer_klein: "Zeer klein",
}

const notBuyingReasonLabels: Record<string, string> = {
  geen_reden: "Geen reden, wil kopen",
  prijs: "Prijs",
  inruil: "Inruilvoorstel",
  uitvoering: "Uitvoering / opties",
  twijfel_meerdere: "Twijfel meerdere auto's",
  anders: "Anders",
}

const sellerContactLabels: Record<string, string> = {
  zeer_slecht: "Zeer slecht",
  slecht: "Slecht",
  neutraal: "Neutraal",
  goed: "Goed",
  zeer_goed: "Zeer goed",
}

const improvementAreaLabels: Record<string, string> = {
  niets: "Niets, klaar om te kopen",
  prijs: "Prijs",
  informatie: "Informatie / uitleg",
  opvolging: "Opvolging",
  ander_voertuig: "Ander voertuig",
  anders: "Anders",
}

const howFoundUsLabels: Record<string, string> = {
  autoofy: "Autoofy.nl",
  online_ad: "Online advertentie",
  google: "Google / zoekmachine",
  social_media: "Social media",
  vrienden: "Familie of vrienden",
  showroom: "Showroom / langsgereden",
  anders: "Anders",
}

// Color helpers
const getPurchaseLikelihoodColor = (value: string) => {
  switch (value) {
    case "zeer_groot": return "bg-green-100 text-green-700 border-green-200"
    case "groot": return "bg-lime-100 text-lime-700 border-lime-200"
    case "twijfel": return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "klein": return "bg-orange-100 text-orange-700 border-orange-200"
    case "zeer_klein": return "bg-red-100 text-red-700 border-red-200"
    default: return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

const getSellerContactColor = (value: string) => {
  switch (value) {
    case "zeer_goed": return "bg-green-100 text-green-700 border-green-200"
    case "goed": return "bg-lime-100 text-lime-700 border-lime-200"
    case "neutraal": return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "slecht": return "bg-orange-100 text-orange-700 border-orange-200"
    case "zeer_slecht": return "bg-red-100 text-red-700 border-red-200"
    default: return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export default function FeedbackDashboardPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/feedback")
      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data.feedbacks)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Calculate hot leads (zeer_groot + groot purchase likelihood)
  const hotLeads = feedbacks.filter(f => 
    f.purchaseLikelihood === "zeer_groot" || f.purchaseLikelihood === "groot"
  ).length

  // Calculate positive seller contact (goed + zeer_goed)
  const positiveContact = feedbacks.filter(f => 
    f.sellerContact === "goed" || f.sellerContact === "zeer_goed"
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-autoofy-dark mx-auto mb-4"></div>
          <p className="text-gray-600">Feedback laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-autoofy-dark">Klant Feedback</h1>
            <p className="text-gray-500">Inzicht in koopkans en klanttevredenheid</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {feedbacks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{feedbacks.length}</p>
              <p className="text-sm text-blue-700">Totaal feedback</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900">{hotLeads}</p>
              <p className="text-sm text-green-700">Warme leads</p>
              <p className="text-xs text-green-600 mt-1">Grote koopkans</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-900">
                {feedbacks.length > 0 ? Math.round((positiveContact / feedbacks.length) * 100) : 0}%
              </p>
              <p className="text-sm text-purple-700">Tevreden over verkoper</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="pt-6 text-center">
              <Search className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-900">
                {feedbacks.filter(f => f.howFoundUs === "google").length}
              </p>
              <p className="text-sm text-amber-700">Via Google</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen feedback ontvangen</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Wanneer klanten het feedback formulier invullen na een proefrit, 
              verschijnen hun antwoorden hier.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Customer Info & Key Metrics */}
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 lg:w-72 border-b lg:border-b-0 lg:border-r">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-autoofy-dark text-white flex items-center justify-center font-bold text-lg">
                        {feedback.testride.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{feedback.testride.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(feedback.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Car className="w-4 h-4" />
                      <span className="font-medium">{feedback.testride.carType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(feedback.testride.date)}</span>
                    </div>

                    {/* Key Badges */}
                    <div className="space-y-2">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getPurchaseLikelihoodColor(feedback.purchaseLikelihood)}`}>
                        🛒 Koopkans: {purchaseLikelihoodLabels[feedback.purchaseLikelihood]}
                      </div>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getSellerContactColor(feedback.sellerContact)}`}>
                        👤 Verkoper: {sellerContactLabels[feedback.sellerContact]}
                      </div>
                    </div>

                    {feedback.testride.seller && (
                      <div className="mt-4 pt-3 border-t">
                        <p className="text-xs text-gray-500">
                          Verkoper: <span className="font-medium text-gray-700">{feedback.testride.seller.name}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Detailed Answers */}
                  <div className="flex-1 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Reden niet kopen */}
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-orange-700 mb-1">❓ Reden om niet te kopen</p>
                        <p className="text-sm font-medium text-gray-900">{notBuyingReasonLabels[feedback.notBuyingReason]}</p>
                        {feedback.notBuyingComment && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{feedback.notBuyingComment}"</p>
                        )}
                      </div>

                      {/* Wat verbeteren */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">💡 Wat kunnen we verbeteren</p>
                        <p className="text-sm font-medium text-gray-900">{improvementAreaLabels[feedback.improvementArea]}</p>
                        {feedback.improvementComment && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{feedback.improvementComment}"</p>
                        )}
                      </div>

                      {/* Hoe gevonden */}
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-purple-700 mb-1">🔍 Hoe bij ons gekomen</p>
                        <p className="text-sm font-medium text-gray-900">{howFoundUsLabels[feedback.howFoundUs]}</p>
                        {feedback.howFoundComment && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{feedback.howFoundComment}"</p>
                        )}
                      </div>

                      {/* Koopkans toelichting */}
                      {feedback.purchaseComment && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">📝 Toelichting koopkans</p>
                          <p className="text-xs text-gray-600 italic">"{feedback.purchaseComment}"</p>
                        </div>
                      )}

                      {/* Verkoper toelichting */}
                      {feedback.sellerComment && (
                        <div className="bg-slate-100 rounded-lg p-3">
                          <p className="text-xs font-semibold text-slate-700 mb-1">💬 Over de verkoper</p>
                          <p className="text-xs text-gray-600 italic">"{feedback.sellerComment}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
