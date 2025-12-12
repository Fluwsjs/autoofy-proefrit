"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TermsAndConditions } from "@/components/TermsAndConditions"
import { SellerSignature } from "@/components/SellerSignature"
import { CustomerSignature } from "@/components/CustomerSignature"
import { FormInput } from "@/components/FormInput"
import { Label } from "@/components/ui/label"
import { formatDate, formatTime } from "@/lib/utils"
import { 
  ArrowLeft, 
  CheckCircle, 
  Car, 
  User, 
  Calendar, 
  Gauge, 
  FileCheck, 
  PenTool,
  Clock,
  Shield,
  Sparkles,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"
import Image from "next/image"

interface Testride {
  id: string
  customerName: string
  customerEmail: string
  carType: string
  date: string
  startTime: string
  endTime: string
  startKm: number
  endKm: number | null
  status: string
  dealerPlate: {
    id: string
    plate: string
  } | null
}

export default function CompleteTestridePage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const { showToast, ToastComponent } = useToast()
  const [testride, setTestride] = useState<Testride | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completionSignature, setCompletionSignature] = useState("")
  const [customerCompletionSignature, setCustomerCompletionSignature] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  
  // Afrondingsgegevens
  const [completionData, setCompletionData] = useState({
    actualEndDate: "",
    actualEndTime: "",
    actualEndKm: "",
    noDamages: false,
    dealerPlateCardReturned: false,
    greenPlatesNotLost: false,
    allKeysReturned: false,
    completionNotes: "",
  })
  
  // Bereken aantal gereden kilometers
  const drivenKilometers = completionData.actualEndKm && testride
    ? parseInt(completionData.actualEndKm) - testride.startKm
    : 0

  // Check if step 1 is complete
  const isStep1Complete = completionData.actualEndDate && 
    completionData.actualEndTime && 
    completionData.actualEndKm

  // Check if step 2 is complete
  const isStep2Complete = completionData.noDamages && 
    completionData.dealerPlateCardReturned && 
    completionData.greenPlatesNotLost && 
    completionData.allKeysReturned

  // Check if step 3 is complete
  const isStep3Complete = completionSignature && customerCompletionSignature

  useEffect(() => {
    if (params.id) {
      fetchTestride(params.id as string)
    }
  }, [params.id])

  // Auto-fill current date and time on mount
  useEffect(() => {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = now.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
    
    setCompletionData(prev => ({
      ...prev,
      actualEndDate: currentDate,
      actualEndTime: currentTime
    }))
  }, [])

  const fetchTestride = async (id: string) => {
    try {
      const response = await fetch(`/api/testrides/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTestride(data)
        if (data.status === "COMPLETED") {
          showToast("Deze proefrit is al afgerond", "info")
          router.push(`/dashboard/${id}`)
        }
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching testride:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    // Validatie
    if (!completionData.actualEndDate || !completionData.actualEndTime) {
      showToast("Vul de exacte einddatum en eindtijd in", "error")
      return
    }
    
    if (!completionData.actualEndKm) {
      showToast("Vul de exacte eindkilometerstand in", "error")
      return
    }
    
    // Alle controles zijn verplicht
    if (!completionData.noDamages || !completionData.dealerPlateCardReturned || !completionData.greenPlatesNotLost || !completionData.allKeysReturned) {
      showToast("Vink alle controle items aan", "error")
      return
    }
    
    if (!completionSignature) {
      showToast("Bedrijfshandtekening is verplicht", "error")
      return
    }
    
    if (!customerCompletionSignature) {
      showToast("Klanthandtekening is verplicht", "error")
      return
    }

    if (!confirm("Weet u zeker dat u deze proefrit wilt afronden?")) {
      return
    }

    setCompleting(true)
    try {
      const actualEndDateTime = new Date(`${completionData.actualEndDate}T${completionData.actualEndTime}`)
      
      const response = await fetch(`/api/testrides/${testride?.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionSignatureUrl: completionSignature,
          customerCompletionSignatureUrl: customerCompletionSignature,
          actualEndTime: actualEndDateTime.toISOString(),
          actualEndKm: parseInt(completionData.actualEndKm),
          completionNotes: completionData.completionNotes || undefined,
        }),
      })

      if (response.ok) {
        showToast("Proefrit succesvol afgerond!", "success")
        router.push(`/dashboard/${testride?.id}`)
      } else {
        const data = await response.json()
        showToast(data.error || "Fout bij afronden proefrit", "error")
      }
    } catch (error) {
      console.error("Error completing testride:", error)
      showToast("Fout bij afronden proefrit", "error")
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-autoofy-red/20 border-t-autoofy-red rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Laden...</p>
        </div>
      </div>
    )
  }

  if (!testride) {
    return null
  }

  const steps = [
    { number: 1, title: "Ritgegevens", icon: Gauge },
    { number: 2, title: "Controles", icon: FileCheck },
    { number: 3, title: "Handtekeningen", icon: PenTool },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-8">
      {ToastComponent}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-autoofy-dark via-autoofy-dark to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link href={`/dashboard/${testride.id}`}>
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar details
              </Button>
            </Link>
            <Image
              src="/autoofy-logo.svg"
              alt="Autoofy Logo"
              width={120}
              height={14}
              className="h-6 w-auto brightness-0 invert"
              priority
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Proefrit Afronden</h1>
              <p className="text-white/70 text-sm mt-1">Vul de gegevens in om de proefrit af te ronden</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        {/* Proefrit Info Card */}
        <Card className="mb-6 overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-autoofy-red/5 via-white to-autoofy-dark/5 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-autoofy-dark/10 rounded-lg">
                  <User className="h-5 w-5 text-autoofy-dark" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Klant</p>
                  <p className="font-semibold text-slate-900 truncate">{testride.customerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-autoofy-red/10 rounded-lg">
                  <Car className="h-5 w-5 text-autoofy-red" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Voertuig</p>
                  <p className="font-semibold text-slate-900 truncate">{testride.carType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Datum</p>
                  <p className="font-semibold text-slate-900">{formatDate(testride.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gauge className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Start KM</p>
                  <p className="font-semibold text-slate-900">{testride.startKm.toLocaleString()} km</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line Background */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full mx-16 md:mx-24"></div>
            {/* Progress Line Fill */}
            <div 
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-autoofy-red to-autoofy-dark rounded-full mx-16 md:mx-24 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%`, maxWidth: 'calc(100% - 8rem)' }}
            ></div>
            
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isComplete = currentStep > step.number || 
                (step.number === 1 && isStep1Complete) ||
                (step.number === 2 && isStep2Complete) ||
                (step.number === 3 && isStep3Complete)
              
              return (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isComplete 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
                      : isActive 
                        ? 'bg-gradient-to-br from-autoofy-red to-autoofy-dark text-white ring-4 ring-autoofy-red/20' 
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden md:block ${
                    isActive ? 'text-autoofy-dark' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Ritgegevens */}
          {currentStep === 1 && (
            <Card className="shadow-xl border-0 overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-r from-autoofy-dark to-slate-800 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Stap 1: Ritgegevens Invullen</h2>
                    <p className="text-white/70 text-sm">Vul de exacte eindgegevens van de proefrit in</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-autoofy-red" />
                      Exacte einddatum *
                    </Label>
                    <FormInput
                      type="date"
                      value={completionData.actualEndDate}
                      onChange={(e) =>
                        setCompletionData({ ...completionData, actualEndDate: e.target.value })
                      }
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-autoofy-red" />
                      Exacte eindtijd *
                    </Label>
                    <FormInput
                      type="time"
                      value={completionData.actualEndTime}
                      onChange={(e) =>
                        setCompletionData({ ...completionData, actualEndTime: e.target.value })
                      }
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-autoofy-red" />
                      Eindkilometerstand *
                    </Label>
                    <FormInput
                      type="number"
                      value={completionData.actualEndKm}
                      onChange={(e) =>
                        setCompletionData({ ...completionData, actualEndKm: e.target.value })
                      }
                      required
                      min={testride.startKm}
                      placeholder={`Min. ${testride.startKm}`}
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                
                {/* Gereden kilometers weergave */}
                {drivenKilometers > 0 && (
                  <div className="bg-gradient-to-r from-autoofy-dark/5 via-autoofy-red/5 to-autoofy-dark/5 rounded-xl p-6 border border-autoofy-dark/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-autoofy-red/10 rounded-xl">
                          <Car className="h-8 w-8 text-autoofy-red" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">Totaal gereden</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-autoofy-red to-autoofy-dark bg-clip-text text-transparent">
                            {drivenKilometers.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{testride.startKm.toLocaleString()} km → {parseInt(completionData.actualEndKm).toLocaleString()} km</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extra notities */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Extra notities bij afronding (optioneel)</Label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-autoofy-red/20 focus:border-autoofy-red transition-all"
                    value={completionData.completionNotes}
                    onChange={(e) =>
                      setCompletionData({ ...completionData, completionNotes: e.target.value })
                    }
                    placeholder="Eventuele opmerkingen bij het afronden van de proefrit..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Complete}
                    className="bg-gradient-to-r from-autoofy-red to-autoofy-dark hover:from-autoofy-red/90 hover:to-autoofy-dark/90 text-white px-8 h-12 text-base font-medium shadow-lg"
                  >
                    Volgende stap
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Controles */}
          {currentStep === 2 && (
            <Card className="shadow-xl border-0 overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Stap 2: Controle Checklist</h2>
                    <p className="text-white/70 text-sm">Bevestig dat alles in orde is</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { 
                      key: 'noDamages', 
                      label: 'Geen schades geconstateerd',
                      description: 'Het voertuig is zonder nieuwe schades teruggekomen',
                      icon: Shield
                    },
                    { 
                      key: 'dealerPlateCardReturned', 
                      label: 'Handelaarskentekenpasje ingeleverd',
                      description: 'Het kentekenpasje is teruggegeven door de klant',
                      icon: FileCheck
                    },
                    { 
                      key: 'greenPlatesNotLost', 
                      label: 'Groene platen niet verloren',
                      description: 'De groene platen zijn nog aanwezig op het voertuig',
                      icon: Car
                    },
                    { 
                      key: 'allKeysReturned', 
                      label: 'Alle sleutels zijn ingeleverd',
                      description: 'Alle meegegeven sleutels zijn teruggegeven',
                      icon: CheckCircle
                    },
                  ].map((item) => {
                    const Icon = item.icon
                    const isChecked = completionData[item.key as keyof typeof completionData] as boolean
                    
                    return (
                      <label 
                        key={item.key}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          isChecked 
                            ? 'border-green-500 bg-green-50/50' 
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isChecked 
                            ? 'bg-green-500 text-white' 
                            : 'border-2 border-slate-300'
                        }`}>
                          {isChecked && <CheckCircle className="h-4 w-4" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setCompletionData({ ...completionData, [item.key]: e.target.checked })
                          }
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${isChecked ? 'text-green-600' : 'text-slate-400'}`} />
                            <span className={`font-medium ${isChecked ? 'text-green-900' : 'text-slate-700'}`}>
                              {item.label}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${isChecked ? 'text-green-700' : 'text-slate-500'}`}>
                            {item.description}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Vorige
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStep2Complete}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 h-12 text-base font-medium shadow-lg"
                  >
                    Volgende stap
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Handtekeningen */}
          {currentStep === 3 && (
            <Card className="shadow-xl border-0 overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300">
              <div className="bg-gradient-to-r from-autoofy-red to-rose-600 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Stap 3: Handtekeningen</h2>
                    <p className="text-white/70 text-sm">Bevestig de afronding met handtekeningen</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                {/* Warning */}
                <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Belangrijk</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Door te ondertekenen bevestigt de klant dat het voertuig in goede staat is teruggebracht.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Verkoper handtekening */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    completionSignature ? 'border-green-500 bg-green-50/30' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      {completionSignature ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <PenTool className="h-5 w-5 text-slate-400" />
                      )}
                      <span className="font-medium text-slate-700">Handtekening Verkoper</span>
                    </div>
                    <SellerSignature onUse={setCompletionSignature} hideReuse={true} />
                  </div>
                  
                  {/* Klant handtekening */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    customerCompletionSignature ? 'border-green-500 bg-green-50/30' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      {customerCompletionSignature ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <PenTool className="h-5 w-5 text-slate-400" />
                      )}
                      <span className="font-medium text-slate-700">Handtekening Klant</span>
                    </div>
                    <CustomerSignature onSave={setCustomerCompletionSignature} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Vorige
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={completing || !isStep3Complete}
                    className="bg-gradient-to-r from-autoofy-red to-autoofy-dark hover:from-autoofy-red/90 hover:to-autoofy-dark/90 text-white px-8 h-14 text-base font-medium shadow-xl flex-1 sm:flex-initial"
                  >
                    {completing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                        Afronden...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Proefrit Definitief Afronden
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Card - Always visible */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-slate-700">Samenvatting</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-medium text-amber-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Bezig met afronden
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Starttijd</p>
                  <p className="font-medium text-slate-900">{formatTime(testride.startTime)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Eindtijd</p>
                  <p className="font-medium text-slate-900">
                    {completionData.actualEndTime || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Gereden KM</p>
                  <p className="font-bold text-autoofy-red">
                    {drivenKilometers > 0 ? `${drivenKilometers.toLocaleString()} km` : '-'}
                  </p>
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isStep1Complete ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isStep1Complete ? <CheckCircle className="h-3.5 w-3.5" /> : <Gauge className="h-3.5 w-3.5" />}
                  Ritgegevens
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isStep2Complete ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isStep2Complete ? <CheckCircle className="h-3.5 w-3.5" /> : <FileCheck className="h-3.5 w-3.5" />}
                  Controles
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isStep3Complete ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isStep3Complete ? <CheckCircle className="h-3.5 w-3.5" /> : <PenTool className="h-3.5 w-3.5" />}
                  Handtekeningen
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Voorwaarden */}
          <div className="pt-4">
            <TermsAndConditions />
          </div>
        </div>
      </div>
    </div>
  )
}
