"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { ArrowLeft, Building2, Save, Upload, X, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Label } from "@/components/ui/label"

export default function CompanyInfoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")
  const { data: session } = useSession()
  const { showToast, ToastComponent } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyData, setCompanyData] = useState({
    companyName: "",
    companyAddress: "",
    companyZipCode: "",
    companyCity: "",
    companyPhone: "",
    companyKvK: "",
    companyVAT: "",
    companyLogo: "",
  })

  useEffect(() => {
    if (session) {
      fetchCompanyInfo()
    }
  }, [session])

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch("/api/company-info")
      if (response.ok) {
        const data = await response.json()
        setCompanyData({
          companyName: data.companyName || "",
          companyAddress: data.companyAddress || "",
          companyZipCode: data.companyZipCode || "",
          companyCity: data.companyCity || "",
          companyPhone: data.companyPhone || "",
          companyKvK: data.companyKvK || "",
          companyVAT: data.companyVAT || "",
          companyLogo: data.companyLogo || "",
        })
      }
    } catch (error) {
      console.error("Error fetching company info:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast("Alleen afbeeldingen zijn toegestaan", "error")
      return
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      showToast("Logo mag maximaal 500KB zijn", "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setCompanyData({ ...companyData, companyLogo: event.target.result as string })
        showToast("Logo toegevoegd", "success")
      }
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setCompanyData({ ...companyData, companyLogo: "" })
    showToast("Logo verwijderd", "info")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Prepare data - convert empty strings to undefined for optional fields
      const dataToSend = {
        companyName: companyData.companyName,
        companyAddress: companyData.companyAddress,
        companyZipCode: companyData.companyZipCode,
        companyCity: companyData.companyCity,
        companyPhone: companyData.companyPhone,
        companyKvK: companyData.companyKvK || undefined,
        companyVAT: companyData.companyVAT || undefined,
        companyLogo: companyData.companyLogo || undefined,
      }

      const response = await fetch("/api/company-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (response.ok) {
        showToast("Bedrijfsgegevens opgeslagen", "success")
        
        // If coming from onboarding, trigger wizard to reopen
        if (returnTo === "onboarding") {
          setTimeout(() => {
            localStorage.removeItem('welcomeWizardShown')
            router.push("/dashboard?openWizard=true&step=1")
          }, 1000)
        } else {
          // Otherwise redirect to dashboard after 1 second
          setTimeout(() => {
            router.push("/dashboard")
          }, 1000)
        }
      } else {
        showToast(result.error || "Fout bij opslaan bedrijfsgegevens", "error")
      }
    } catch (error) {
      console.error("Error saving company info:", error)
      showToast("Fout bij opslaan bedrijfsgegevens", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Laden...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {ToastComponent}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          if (returnTo === "onboarding") {
            localStorage.removeItem('welcomeWizardShown')
            router.push("/dashboard?openWizard=true&step=1")
          } else {
            router.push("/dashboard")
          }
        }}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {returnTo === "onboarding" ? "Terug naar onboarding" : "Terug naar dashboard"}
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-autoofy-dark/5 to-autoofy-red/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-autoofy-dark" />
            Bedrijfsgegevens
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Deze gegevens worden weergegeven op alle proefrit formulieren en PDF's
          </p>
          {returnTo === "onboarding" && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Je bent in de onboarding wizard. Vul je bedrijfsgegevens in om door te gaan.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="Bedrijfsnaam *"
                  value={companyData.companyName}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, companyName: e.target.value })
                  }
                  required
                  placeholder="Bijv. Autobedrijf Van der Berg B.V."
                />
              </div>

              <div className="md:col-span-2">
                <FormInput
                  label="Adres *"
                  value={companyData.companyAddress}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, companyAddress: e.target.value })
                  }
                  required
                  placeholder="Bijv. Hoofdstraat 123"
                />
              </div>

              <FormInput
                label="Postcode *"
                value={companyData.companyZipCode}
                onChange={(e) =>
                  setCompanyData({ ...companyData, companyZipCode: e.target.value })
                }
                required
                placeholder="Bijv. 1234 AB"
              />

              <FormInput
                label="Plaats *"
                value={companyData.companyCity}
                onChange={(e) =>
                  setCompanyData({ ...companyData, companyCity: e.target.value })
                }
                required
                placeholder="Bijv. Amsterdam"
              />

              <FormInput
                label="Telefoonnummer *"
                type="tel"
                value={companyData.companyPhone}
                onChange={(e) =>
                  setCompanyData({ ...companyData, companyPhone: e.target.value })
                }
                required
                placeholder="Bijv. 020-1234567"
              />

              <FormInput
                label="KvK nummer"
                value={companyData.companyKvK}
                onChange={(e) =>
                  setCompanyData({ ...companyData, companyKvK: e.target.value })
                }
                placeholder="Bijv. 12345678"
              />

              <div className="md:col-span-2">
                <FormInput
                  label="BTW nummer"
                  value={companyData.companyVAT}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, companyVAT: e.target.value })
                  }
                  placeholder="Bijv. NL123456789B01"
                />
              </div>
            </div>

            {/* Logo upload section */}
            <div className="pt-6 border-t">
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <ImageIcon className="h-5 w-5 text-autoofy-dark" />
                Bedrijfslogo
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Upload je bedrijfslogo. Dit wordt weergegeven op alle proefrit formulieren en PDF&apos;s.
                <br />
                <span className="text-xs">Aanbevolen: PNG of JPG, max 500KB, landscape formaat</span>
              </p>
              
              {companyData.companyLogo ? (
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <img 
                      src={companyData.companyLogo} 
                      alt="Bedrijfslogo" 
                      className="max-h-24 max-w-xs object-contain rounded-lg border-2 border-gray-200 bg-white p-2"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium">✓ Logo geüpload</p>
                    <label className="cursor-pointer">
                      <span className="text-sm text-autoofy-dark hover:underline">Wijzig logo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-autoofy-red hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-autoofy-red">Klik om te uploaden</span> of sleep je logo hierheen
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (max 500KB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                disabled={saving}
                className="bg-autoofy-red text-white hover:bg-autoofy-red/90"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Opslaan
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (returnTo === "onboarding") {
                    localStorage.removeItem('welcomeWizardShown')
                    router.push("/dashboard?openWizard=true&step=1")
                  } else {
                    router.push("/dashboard")
                  }
                }}
              >
                Annuleren
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

