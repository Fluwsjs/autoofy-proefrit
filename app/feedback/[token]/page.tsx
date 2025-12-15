"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Check, Heart, ThumbsUp, ThumbsDown, Car, Calendar, User } from "lucide-react"

interface TestrideInfo {
  customerName: string
  carType: string
  date: string
  sellerName: string | null
  companyName: string
  companyLogo: string | null
}

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [testrideInfo, setTestrideInfo] = useState<TestrideInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form state
  const [overallRating, setOverallRating] = useState(0)
  const [serviceRating, setServiceRating] = useState(0)
  const [vehicleRating, setVehicleRating] = useState(0)
  const [infoRating, setInfoRating] = useState(0)
  const [bestPart, setBestPart] = useState("")
  const [improvements, setImprovements] = useState("")
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [additionalComments, setAdditionalComments] = useState("")

  useEffect(() => {
    fetchTestrideInfo()
  }, [token])

  const fetchTestrideInfo = async () => {
    try {
      const response = await fetch(`/api/feedback/${token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
        return
      }

      setTestrideInfo(data.testride)
    } catch (err) {
      setError("Er is een fout opgetreden bij het laden")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (overallRating === 0 || serviceRating === 0 || vehicleRating === 0 || infoRating === 0) {
      alert("Vul alstublieft alle beoordelingen in")
      return
    }

    if (wouldRecommend === null) {
      alert("Geef aan of u ons zou aanbevelen")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallRating,
          serviceRating,
          vehicleRating,
          infoRating,
          bestPart: bestPart || undefined,
          improvements: improvements || undefined,
          wouldRecommend,
          additionalComments: additionalComments || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Er is een fout opgetreden")
        return
      }

      setSubmitted(true)
    } catch (err) {
      alert("Er is een fout opgetreden bij het versturen")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Star rating component
  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number
    onChange: (val: number) => void
    label: string 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😕</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oeps!</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Bedankt voor uw feedback!</h2>
            <p className="text-gray-600 mb-6">
              Uw mening helpt {testrideInfo?.companyName} om de service te verbeteren.
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-medium">Wij waarderen uw tijd</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {testrideInfo?.companyLogo ? (
            <img 
              src={testrideInfo.companyLogo} 
              alt={testrideInfo.companyName}
              className="h-16 object-contain mx-auto mb-4"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {testrideInfo?.companyName}
            </h1>
          )}
          <p className="text-gray-600">Wij horen graag uw mening</p>
        </div>

        {/* Testride Info Card */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="py-6">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 opacity-80" />
                <span>{testrideInfo?.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 opacity-80" />
                <span className="font-semibold">{testrideInfo?.carType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 opacity-80" />
                <span>{testrideInfo?.date && formatDate(testrideInfo.date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-xl text-center">
              Hoe was uw proefrit ervaring?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating Questions */}
              <div className="grid gap-6 sm:grid-cols-2">
                <StarRating
                  value={overallRating}
                  onChange={setOverallRating}
                  label="🌟 Algehele ervaring"
                />
                <StarRating
                  value={serviceRating}
                  onChange={setServiceRating}
                  label="👤 Service van de verkoper"
                />
                <StarRating
                  value={vehicleRating}
                  onChange={setVehicleRating}
                  label="🚗 Staat van het voertuig"
                />
                <StarRating
                  value={infoRating}
                  onChange={setInfoRating}
                  label="📋 Informatievoorziening"
                />
              </div>

              {/* Would Recommend */}
              <div className="bg-slate-50 rounded-xl p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Zou u {testrideInfo?.companyName} aanbevelen aan vrienden of familie?
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(true)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all ${
                      wouldRecommend === true
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <ThumbsUp className={`w-6 h-6 ${wouldRecommend === true ? "fill-current" : ""}`} />
                    <span className="font-medium">Ja, zeker!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(false)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all ${
                      wouldRecommend === false
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                    }`}
                  >
                    <ThumbsDown className={`w-6 h-6 ${wouldRecommend === false ? "fill-current" : ""}`} />
                    <span className="font-medium">Nee</span>
                  </button>
                </div>
              </div>

              {/* Open Questions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💎 Wat vond u het beste aan uw bezoek? (optioneel)
                  </label>
                  <textarea
                    value={bestPart}
                    onChange={(e) => setBestPart(e.target.value)}
                    placeholder="Bijvoorbeeld: de vriendelijke ontvangst, de uitleg over de auto..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💡 Wat kunnen wij verbeteren? (optioneel)
                  </label>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Wij staan open voor suggesties..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    maxLength={1000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Overige opmerkingen (optioneel)
                  </label>
                  <textarea
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Heeft u nog iets toe te voegen?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    maxLength={2000}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Versturen...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Feedback versturen
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by <span className="font-medium">Autoofy</span>
        </p>
      </div>
    </div>
  )
}

