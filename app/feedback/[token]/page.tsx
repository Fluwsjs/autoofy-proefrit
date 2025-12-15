"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Car, Calendar, User } from "lucide-react"

interface TestrideInfo {
  customerName: string
  carType: string
  date: string
  sellerName: string | null
  companyName: string
  companyLogo: string | null
}

// Options for each question
const purchaseLikelihoodOptions = [
  { value: "zeer_groot", label: "Zeer groot", color: "green" },
  { value: "groot", label: "Groot", color: "lime" },
  { value: "twijfel", label: "Twijfel", color: "yellow" },
  { value: "klein", label: "Klein", color: "orange" },
  { value: "zeer_klein", label: "Zeer klein", color: "red" },
]

const notBuyingReasonOptions = [
  { value: "geen_reden", label: "Geen reden, ik wil kopen" },
  { value: "prijs", label: "Prijs" },
  { value: "inruil", label: "Inruilvoorstel" },
  { value: "uitvoering", label: "Uitvoering / opties" },
  { value: "twijfel_meerdere", label: "Twijfel tussen meerdere auto's" },
  { value: "anders", label: "Anders" },
]

const sellerContactOptions = [
  { value: "zeer_slecht", label: "Zeer slecht", color: "red" },
  { value: "slecht", label: "Slecht", color: "orange" },
  { value: "neutraal", label: "Neutraal", color: "yellow" },
  { value: "goed", label: "Goed", color: "lime" },
  { value: "zeer_goed", label: "Zeer goed", color: "green" },
]

const improvementAreaOptions = [
  { value: "niets", label: "Niets, ik ben klaar om te kopen" },
  { value: "prijs", label: "Prijs" },
  { value: "informatie", label: "Informatie / uitleg" },
  { value: "opvolging", label: "Opvolging" },
  { value: "ander_voertuig", label: "Ander voertuig / alternatief" },
  { value: "anders", label: "Anders" },
]

const howFoundUsOptions = [
  { value: "autoofy", label: "Autoofy.nl" },
  { value: "online_ad", label: "Online advertentie" },
  { value: "google", label: "Google / zoekmachine" },
  { value: "social_media", label: "Social media" },
  { value: "vrienden", label: "Via familie of vrienden" },
  { value: "showroom", label: "Langsgereden / showroom" },
  { value: "anders", label: "Anders" },
]

export default function FeedbackPage() {
  const params = useParams()
  const token = params.token as string

  const [testrideInfo, setTestrideInfo] = useState<TestrideInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form state
  const [purchaseLikelihood, setPurchaseLikelihood] = useState("")
  const [purchaseComment, setPurchaseComment] = useState("")
  const [notBuyingReason, setNotBuyingReason] = useState("")
  const [notBuyingComment, setNotBuyingComment] = useState("")
  const [sellerContact, setSellerContact] = useState("")
  const [sellerComment, setSellerComment] = useState("")
  const [improvementArea, setImprovementArea] = useState("")
  const [improvementComment, setImprovementComment] = useState("")
  const [howFoundUs, setHowFoundUs] = useState("")
  const [howFoundComment, setHowFoundComment] = useState("")

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

    if (!purchaseLikelihood || !notBuyingReason || !sellerContact || !improvementArea || !howFoundUs) {
      alert("Vul alstublieft alle vragen in")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseLikelihood,
          purchaseComment: purchaseComment || undefined,
          notBuyingReason,
          notBuyingComment: notBuyingComment || undefined,
          sellerContact,
          sellerComment: sellerComment || undefined,
          improvementArea,
          improvementComment: improvementComment || undefined,
          howFoundUs,
          howFoundComment: howFoundComment || undefined,
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

  // Radio button group component
  const RadioGroup = ({ 
    options, 
    value, 
    onChange, 
    name,
    showColors = false 
  }: { 
    options: { value: string; label: string; color?: string }[]
    value: string
    onChange: (val: string) => void
    name: string
    showColors?: boolean
  }) => (
    <div className="space-y-2">
      {options.map((option) => {
        const isSelected = value === option.value
        let colorClass = "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        
        if (isSelected && showColors && option.color) {
          switch (option.color) {
            case "green": colorClass = "border-green-500 bg-green-50"; break
            case "lime": colorClass = "border-lime-500 bg-lime-50"; break
            case "yellow": colorClass = "border-yellow-500 bg-yellow-50"; break
            case "orange": colorClass = "border-orange-500 bg-orange-50"; break
            case "red": colorClass = "border-red-500 bg-red-50"; break
          }
        } else if (isSelected) {
          colorClass = "border-blue-500 bg-blue-50"
        }

        return (
          <label
            key={option.value}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${colorClass}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className={`font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )

  // Comment input component
  const CommentInput = ({ 
    value, 
    onChange, 
    placeholder = "Toelichting (optioneel)..." 
  }: { 
    value: string
    onChange: (val: string) => void
    placeholder?: string
  }) => (
    <div className="mt-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
        rows={2}
        maxLength={1000}
      />
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
              Uw mening helpt {testrideInfo?.companyName} om de service te verbeteren en u beter van dienst te zijn.
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <span className="text-2xl">🚗</span>
              <span className="font-medium">Veel rijplezier gewenst!</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          {testrideInfo?.companyLogo ? (
            <img 
              src={testrideInfo.companyLogo} 
              alt={testrideInfo.companyName}
              className="h-14 object-contain mx-auto mb-3"
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {testrideInfo?.companyName}
            </h1>
          )}
          <p className="text-gray-600 text-sm">Feedback formulier</p>
        </div>

        {/* Testride Info Card */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 opacity-80" />
                <span>{testrideInfo?.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 opacity-80" />
                <span className="font-semibold">{testrideInfo?.carType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 opacity-80" />
                <span>{testrideInfo?.date && formatDate(testrideInfo.date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Vraag 1: Koopkans */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Hoe groot is de kans dat u deze auto bij ons koopt?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                options={purchaseLikelihoodOptions}
                value={purchaseLikelihood}
                onChange={setPurchaseLikelihood}
                name="purchaseLikelihood"
                showColors
              />
              <CommentInput value={purchaseComment} onChange={setPurchaseComment} />
            </CardContent>
          </Card>

          {/* Vraag 2: Reden om niet te kopen */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Wat is de belangrijkste reden om (nog) niet te kopen?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                options={notBuyingReasonOptions}
                value={notBuyingReason}
                onChange={setNotBuyingReason}
                name="notBuyingReason"
              />
              <CommentInput value={notBuyingComment} onChange={setNotBuyingComment} />
            </CardContent>
          </Card>

          {/* Vraag 3: Contact met verkoper */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Hoe heeft u het contact met de verkoper ervaren?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                options={sellerContactOptions}
                value={sellerContact}
                onChange={setSellerContact}
                name="sellerContact"
                showColors
              />
              <CommentInput value={sellerComment} onChange={setSellerComment} />
            </CardContent>
          </Card>

          {/* Vraag 4: Wat kunnen we verbeteren */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Wat kunnen wij verbeteren om uw aankoopbeslissing te versnellen?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                options={improvementAreaOptions}
                value={improvementArea}
                onChange={setImprovementArea}
                name="improvementArea"
              />
              <CommentInput value={improvementComment} onChange={setImprovementComment} />
            </CardContent>
          </Card>

          {/* Vraag 5: Hoe bij ons gekomen */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                Hoe bent u bij ons autobedrijf terechtgekomen?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                options={howFoundUsOptions}
                value={howFoundUs}
                onChange={setHowFoundUs}
                name="howFoundUs"
              />
              <CommentInput value={howFoundComment} onChange={setHowFoundComment} />
            </CardContent>
          </Card>

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

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-medium">Autoofy</span>
        </p>
      </div>
    </div>
  )
}
