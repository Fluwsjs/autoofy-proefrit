"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Users, ArrowLeft, Car, Calendar } from "lucide-react"
import Link from "next/link"

interface Feedback {
  id: string
  overallRating: number
  serviceRating: number
  vehicleRating: number
  infoRating: number
  bestPart: string | null
  improvements: string | null
  wouldRecommend: boolean
  additionalComments: string | null
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
  averages: {
    overall: number
    service: number
    vehicle: number
    info: number
    recommendRate: number
  } | null
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

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )

  const AverageStarDisplay = ({ rating, label }: { rating: number; label: string }) => (
    <div className="text-center">
      <div className="flex justify-center gap-0.5 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )

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
            <p className="text-gray-500">Bekijk wat uw klanten vinden van hun proefrit ervaring</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.averages && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-sm text-blue-700">Totaal feedback</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
            <CardContent className="pt-6">
              <AverageStarDisplay rating={stats.averages.overall} label="Algeheel" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <AverageStarDisplay rating={stats.averages.service} label="Service" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardContent className="pt-6">
              <AverageStarDisplay rating={stats.averages.vehicle} label="Voertuig" />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6 text-center">
              <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900">{stats.averages.recommendRate.toFixed(0)}%</p>
              <p className="text-sm text-green-700">Zou aanbevelen</p>
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
              verschijnen hun beoordelingen hier.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Ratings */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 md:w-80 border-b md:border-b-0 md:border-r">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-autoofy-dark text-white flex items-center justify-center font-bold text-lg">
                        {feedback.testride.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{feedback.testride.customerName}</p>
                        <p className="text-sm text-gray-500">{formatDate(feedback.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Car className="w-4 h-4" />
                      <span>{feedback.testride.carType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(feedback.testride.date)}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Algeheel</span>
                        <StarDisplay rating={feedback.overallRating} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Service</span>
                        <StarDisplay rating={feedback.serviceRating} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Voertuig</span>
                        <StarDisplay rating={feedback.vehicleRating} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Informatie</span>
                        <StarDisplay rating={feedback.infoRating} />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        feedback.wouldRecommend 
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {feedback.wouldRecommend ? (
                          <>
                            <ThumbsUp className="w-4 h-4" />
                            Zou aanbevelen
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-4 h-4" />
                            Zou niet aanbevelen
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Comments */}
                  <div className="flex-1 p-6">
                    {feedback.bestPart && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-green-700 mb-1">💎 Wat het beste was:</p>
                        <p className="text-gray-700 bg-green-50 rounded-lg p-3">{feedback.bestPart}</p>
                      </div>
                    )}

                    {feedback.improvements && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-orange-700 mb-1">💡 Verbeterpunten:</p>
                        <p className="text-gray-700 bg-orange-50 rounded-lg p-3">{feedback.improvements}</p>
                      </div>
                    )}

                    {feedback.additionalComments && (
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">📝 Overige opmerkingen:</p>
                        <p className="text-gray-700 bg-blue-50 rounded-lg p-3">{feedback.additionalComments}</p>
                      </div>
                    )}

                    {!feedback.bestPart && !feedback.improvements && !feedback.additionalComments && (
                      <p className="text-gray-400 italic">Geen aanvullende opmerkingen</p>
                    )}

                    {feedback.testride.seller && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Verkoper: <span className="font-medium text-gray-700">{feedback.testride.seller.name}</span>
                        </p>
                      </div>
                    )}
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

