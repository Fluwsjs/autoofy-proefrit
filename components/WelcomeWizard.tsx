"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, CreditCard, CheckCircle2, ArrowRight, X, 
  Sparkles, FileText, Clock, BarChart3 
} from "lucide-react"
import Link from "next/link"

interface WelcomeWizardProps {
  onClose: () => void
  companyInfoComplete: boolean
  hasDealerPlates: boolean
  hasTestrides: boolean
  initialStep?: number
}

export function WelcomeWizard({ 
  onClose, 
  companyInfoComplete, 
  hasDealerPlates, 
  hasTestrides,
  initialStep = 0
}: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  
  // Update step when initialStep changes (when returning from sub-pages)
  useEffect(() => {
    setCurrentStep(initialStep)
  }, [initialStep])

  const steps = [
    {
      title: "Welkom bij Autoofy Proefrit! 🎉",
      description: "Laten we je account in een paar stappen instellen",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Met Autoofy Proefrit beheer je eenvoudig al je proefritten. 
            Laten we beginnen met het instellen van je account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-autoofy-red/5 rounded-lg border border-autoofy-red/20 hover:border-autoofy-red/40 transition-colors">
              <FileText className="h-8 w-8 text-autoofy-red mb-2" />
              <h4 className="font-semibold text-sm mb-1 text-autoofy-dark">Digitale Formulieren</h4>
              <p className="text-xs text-gray-600">Maak snel en eenvoudig proefrit formulieren</p>
            </div>
            <div className="p-4 bg-autoofy-dark/5 rounded-lg border border-autoofy-dark/20 hover:border-autoofy-dark/40 transition-colors">
              <Clock className="h-8 w-8 text-autoofy-dark mb-2" />
              <h4 className="font-semibold text-sm mb-1 text-autoofy-dark">Real-time Tracking</h4>
              <p className="text-xs text-gray-600">Volg de status van elke proefrit</p>
            </div>
            <div className="p-4 bg-autoofy-red/5 rounded-lg border border-autoofy-red/20 hover:border-autoofy-red/40 transition-colors">
              <BarChart3 className="h-8 w-8 text-autoofy-red mb-2" />
              <h4 className="font-semibold text-sm mb-1 text-autoofy-dark">Inzichten & Rapporten</h4>
              <p className="text-xs text-gray-600">Bekijk statistieken en analyses</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Bedrijfsgegevens",
      description: "Deze verschijnen op al je proefrit formulieren",
      icon: Building2,
      content: (
        <div className="space-y-4">
          {companyInfoComplete ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Bedrijfsgegevens zijn ingevuld!</p>
                <p className="text-sm text-green-700 mt-1">
                  Je bedrijfsgegevens worden automatisch toegevoegd aan alle PDF's.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-900 mb-2">Vul je bedrijfsgegevens in</p>
              <p className="text-sm text-yellow-700 mb-4">
                Dit is belangrijk voor professionele proefrit formulieren.
              </p>
              <Link href="/dashboard/company-info?returnTo=onboarding">
                <Button className="bg-autoofy-red hover:bg-autoofy-red/90" onClick={onClose}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Bedrijfsgegevens invullen
                </Button>
              </Link>
            </div>
          )}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Wat wordt er gevraagd?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Bedrijfsnaam</li>
              <li>Adres en contactgegevens</li>
              <li>KvK en BTW nummer (optioneel)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Handelaarskentekens (Optioneel)",
      description: "Voeg je handelaarskentekens toe voor sneller werken",
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          {hasDealerPlates ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Je hebt handelaarskentekens toegevoegd!</p>
                <p className="text-sm text-green-700 mt-1">
                  Deze kun je nu snel selecteren bij nieuwe proefritten.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-autoofy-dark/5 border border-autoofy-dark/20 rounded-lg">
              <p className="font-medium text-autoofy-dark mb-2">Voeg handelaarskentekens toe</p>
              <p className="text-sm text-gray-700 mb-4">
                Dit is optioneel, maar bespaart tijd bij het aanmaken van proefritten.
              </p>
              <Link href="/dashboard/dealer-plates?returnTo=onboarding">
                <Button variant="outline" className="border-autoofy-dark/30 hover:bg-autoofy-dark/5" onClick={onClose}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Handelaarskentekens beheren
                </Button>
              </Link>
            </div>
          )}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Voordelen:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Snel selecteren bij nieuwe proefrit</li>
              <li>Automatisch op formulier vermeld</li>
              <li>Overzicht van gebruik per kenteken</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Klaar om te beginnen! 🚀",
      description: "Je bent helemaal ingesteld",
      icon: CheckCircle2,
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-autoofy-red/10 via-autoofy-dark/5 to-autoofy-red/5 rounded-lg border border-autoofy-red/30">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-autoofy-dark mb-2">Perfect! Je bent klaar</h3>
            <p className="text-gray-700">
              Je kunt nu je eerste proefrit aanmaken. Veel succes! 🎉
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="font-medium text-gray-900">Volgende stappen:</p>
            <div className="space-y-2">
              <Link href="/dashboard/new">
                <Button className="w-full bg-autoofy-red hover:bg-autoofy-red/90 justify-between">
                  <span>Maak je eerste proefrit</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Ga naar dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>Tip: Je kunt deze wizard altijd opnieuw openen via Instellingen</p>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        <CardHeader className="relative bg-gradient-to-r from-autoofy-dark/5 to-autoofy-red/5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 hover:bg-white/50"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-autoofy-red/10 rounded-lg border border-autoofy-red/20">
              <Icon className="h-6 w-6 text-autoofy-red" />
            </div>
            <div>
              <CardTitle className="text-xl text-autoofy-dark">{currentStepData.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
            </div>
          </div>
          
          {/* Progress bar with step indicators */}
          <div className="flex gap-2 mt-6">
            {steps.map((step, index) => {
              const isComplete = index < currentStep || 
                (index === 1 && companyInfoComplete) || 
                (index === 2 && hasDealerPlates)
              const isCurrent = index === currentStep
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-green-500' : 
                      isCurrent ? 'bg-autoofy-red' : 
                      'bg-gray-200'
                    }`}
                  />
                  {isComplete && index !== currentStep && (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
          {currentStepData.content}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Vorige
            </Button>
            
            <div className="flex items-center gap-2">
              {/* Show skip button for optional steps (step 2 = dealer plates) */}
              {currentStep === 2 && !hasDealerPlates && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Overslaan
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-autoofy-dark hover:bg-autoofy-dark/90 text-white"
                >
                  Volgende
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="bg-autoofy-red hover:bg-autoofy-red/90 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Afsluiten
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

