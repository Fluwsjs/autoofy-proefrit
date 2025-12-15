"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/FormInput"
import { SellerSignature } from "@/components/SellerSignature"
import { CustomerSignature } from "@/components/CustomerSignature"
import { IdPhotoUploadSimple } from "@/components/IdPhotoUploadSimple"
import { TimePicker } from "@/components/TimePicker"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"

interface DealerPlate {
  id: string
  plate: string
}

interface Seller {
  id: string
  name: string
}

export default function NewTestridePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { showToast, ToastComponent } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customerSignature, setCustomerSignature] = useState("")
  const [sellerSignature, setSellerSignature] = useState("")
  const [idPhotoFrontUrl, setIdPhotoFrontUrl] = useState("")
  const [idPhotoBackUrl, setIdPhotoBackUrl] = useState("")
  const [damagePhotos, setDamagePhotos] = useState<string[]>([])
  const [dealerPlates, setDealerPlates] = useState<DealerPlate[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loadingPlates, setLoadingPlates] = useState(true)

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    startTime: "",
    endTime: "",
    date: "",
    carType: "",
    licensePlate: "",
    driverLicenseNumber: "",
    idCountryOfOrigin: "",
    dealerPlateId: "",
    sellerId: "",
    startKm: "",
    endKm: "",
    notes: "",
    eigenRisico: "0",
    aantalSleutels: "1",
    dealerPlateCardGiven: false,
  })

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('newTestrideFormData')
    const savedSignatures = localStorage.getItem('newTestrideSignatures')
    const savedPhotos = localStorage.getItem('newTestridePhotos')
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(parsedData)
        showToast("Formulierdata hersteld", "info")
      } catch (error) {
        console.error("Error parsing saved form data:", error)
      }
    } else {
      // No saved data - auto-fill current time and today's date
      const now = new Date()
      const currentTime = now.toLocaleTimeString('nl-NL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
      
      setFormData(prev => ({
        ...prev,
        startTime: currentTime,
        date: currentDate
      }))
    }
    
    if (savedSignatures) {
      try {
        const parsedSignatures = JSON.parse(savedSignatures)
        setCustomerSignature(parsedSignatures.customer || "")
        setSellerSignature(parsedSignatures.seller || "")
      } catch (error) {
        console.error("Error parsing saved signatures:", error)
      }
    }
    
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos)
        setIdPhotoFrontUrl(parsedPhotos.front || "")
        setIdPhotoBackUrl(parsedPhotos.back || "")
      } catch (error) {
        console.error("Error parsing saved photos:", error)
      }
    }
  }, [])

  // Auto-save form data to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('newTestrideFormData', JSON.stringify(formData))
    }, 500) // Debounce 500ms
    
    return () => clearTimeout(timeoutId)
  }, [formData])

  // Auto-save signatures
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('newTestrideSignatures', JSON.stringify({
        customer: customerSignature,
        seller: sellerSignature
      }))
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [customerSignature, sellerSignature])

  // Auto-save photos
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('newTestridePhotos', JSON.stringify({
        front: idPhotoFrontUrl,
        back: idPhotoBackUrl
      }))
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [idPhotoFrontUrl, idPhotoBackUrl])

  useEffect(() => {
    if (session) {
      fetchDealerPlates()
      fetchSellers()
    }
  }, [session])

  const fetchDealerPlates = async () => {
    try {
      const response = await fetch("/api/dealer-plates")
      if (response.ok) {
        const result = await response.json()
        // Handle paginated response: { data: [...], pagination: {...} }
        const dealerPlates = result.data || result
        setDealerPlates(dealerPlates)
      }
    } catch (error) {
      console.error("Error fetching dealer plates:", error)
    } finally {
      setLoadingPlates(false)
    }
  }

  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/sellers")
      if (response.ok) {
        const result = await response.json()
        const sellers = result.data || result
        setSellers(sellers)
      }
    } catch (error) {
      console.error("Error fetching sellers:", error)
    }
  }

  const clearFormData = () => {
    if (confirm("Weet u zeker dat u alle ingevulde gegevens wilt wissen?")) {
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        address: "",
        startTime: "",
        endTime: "",
        date: "",
        carType: "",
        licensePlate: "",
        driverLicenseNumber: "",
        idCountryOfOrigin: "",
        dealerPlateId: "",
        sellerId: "",
        startKm: "",
        endKm: "",
        notes: "",
        eigenRisico: "0",
        aantalSleutels: "1",
        dealerPlateCardGiven: false,
      })
      setCustomerSignature("")
      setSellerSignature("")
      setIdPhotoFrontUrl("")
      setIdPhotoBackUrl("")
      setDamagePhotos([])
      localStorage.removeItem('newTestrideFormData')
      localStorage.removeItem('newTestrideSignatures')
      localStorage.removeItem('newTestridePhotos')
      showToast("Formulier gewist", "success")
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError("Datum en tijden zijn verplicht")
      setLoading(false)
      return
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`)
    
    if (endDateTime <= startDateTime) {
      setError("Eindtijd moet na starttijd zijn")
      setLoading(false)
      return
    }

    if (formData.endKm && parseInt(formData.endKm) < parseInt(formData.startKm)) {
      setError("Eindkilometerstand moet groter of gelijk zijn aan startkilometerstand")
      setLoading(false)
      return
    }

    try {
      const date = new Date(formData.date)

      const response = await fetch("/api/testrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          ...formData,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          date: date.toISOString(),
          startKm: parseInt(formData.startKm),
          endKm: formData.endKm ? parseInt(formData.endKm) : undefined,
          customerSignatureUrl: customerSignature || undefined,
          sellerSignatureUrl: sellerSignature || undefined,
          idPhotoFrontUrl: idPhotoFrontUrl || undefined,
          idPhotoBackUrl: idPhotoBackUrl || undefined,
          damagePhotos: damagePhotos.length > 0 ? damagePhotos : undefined,
          customerPhone: formData.customerPhone || undefined,
          licensePlate: formData.licensePlate || undefined,
          driverLicenseNumber: formData.driverLicenseNumber || undefined,
          idCountryOfOrigin: formData.idCountryOfOrigin || undefined,
          dealerPlateId: formData.dealerPlateId || undefined,
          sellerId: formData.sellerId || undefined,
          dealerPlateCardGiven: formData.dealerPlateCardGiven,
          eigenRisico: parseInt(formData.eigenRisico),
          aantalSleutels: parseInt(formData.aantalSleutels),
          notes: formData.notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
      } else {
        // Clear saved form data after successful submit
        localStorage.removeItem('newTestrideFormData')
        localStorage.removeItem('newTestrideSignatures')
        localStorage.removeItem('newTestridePhotos')
        router.push("/dashboard?success=true")
      }
    } catch (err) {
      setError("Er is een fout opgetreden")
    } finally {
      setLoading(false)
    }
  }

        return (
          <div className="max-w-4xl mx-auto space-y-4 pb-20 lg:pb-0">
            {ToastComponent}
            <div className="flex items-center justify-between gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="min-h-[44px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar dashboard
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFormData}
                className="min-h-[44px] text-red-600 border-red-600 hover:bg-red-50"
              >
                Wis formulier
              </Button>
            </div>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Nieuwe Proefrit</CardTitle>
              <p className="text-sm text-slate-600 mt-0.5">Vul alle verplichte velden (*) in</p>
            </div>
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Auto-opgeslagen
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Klantnaam *"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
              />
              <FormInput
                label="Klant e-mailadres *"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                required
              />
              <FormInput
                label="Klant telefoonnummer"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
              />
              <FormInput
                label="Adres *"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Testrit voertuig *"
                value={formData.carType}
                onChange={(e) =>
                  setFormData({ ...formData, carType: e.target.value })
                }
                required
              />
              <FormInput
                label="Kenteken voertuig, meldcode of chassisnummer"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                placeholder="Bijv. AB-123-CD of meldcode/chassisnummer"
              />
              <FormInput
                label="Rijbewijs of BSN nummer"
                value={formData.driverLicenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, driverLicenseNumber: e.target.value })
                }
                placeholder="Bijv. 12345678"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idCountryOfOrigin">Land van herkomst ID kaart of rijbewijs</Label>
                <select
                  id="idCountryOfOrigin"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.idCountryOfOrigin}
                  onChange={(e) =>
                    setFormData({ ...formData, idCountryOfOrigin: e.target.value })
                  }
                >
                  <option value="">Selecteer land...</option>
                  <optgroup label="Meest voorkomend">
                    <option value="Nederland">Nederland</option>
                    <option value="België">België</option>
                    <option value="Duitsland">Duitsland</option>
                    <option value="Polen">Polen</option>
                    <option value="Roemenië">Roemenië</option>
                    <option value="Bulgarije">Bulgarije</option>
                  </optgroup>
                  <optgroup label="West-Europa">
                    <option value="Frankrijk">Frankrijk</option>
                    <option value="Verenigd Koninkrijk">Verenigd Koninkrijk</option>
                    <option value="Ierland">Ierland</option>
                    <option value="Luxemburg">Luxemburg</option>
                    <option value="Zwitserland">Zwitserland</option>
                    <option value="Oostenrijk">Oostenrijk</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Monaco">Monaco</option>
                  </optgroup>
                  <optgroup label="Noord-Europa">
                    <option value="Denemarken">Denemarken</option>
                    <option value="Zweden">Zweden</option>
                    <option value="Noorwegen">Noorwegen</option>
                    <option value="Finland">Finland</option>
                    <option value="IJsland">IJsland</option>
                    <option value="Estland">Estland</option>
                    <option value="Letland">Letland</option>
                    <option value="Litouwen">Litouwen</option>
                  </optgroup>
                  <optgroup label="Oost-Europa">
                    <option value="Tsjechië">Tsjechië</option>
                    <option value="Slowakije">Slowakije</option>
                    <option value="Hongarije">Hongarije</option>
                    <option value="Oekraïne">Oekraïne</option>
                    <option value="Moldavië">Moldavië</option>
                    <option value="Wit-Rusland">Wit-Rusland</option>
                    <option value="Rusland">Rusland</option>
                  </optgroup>
                  <optgroup label="Zuid-Europa">
                    <option value="Italië">Italië</option>
                    <option value="Spanje">Spanje</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Griekenland">Griekenland</option>
                    <option value="Kroatië">Kroatië</option>
                    <option value="Slovenië">Slovenië</option>
                    <option value="Servië">Servië</option>
                    <option value="Bosnië en Herzegovina">Bosnië en Herzegovina</option>
                    <option value="Montenegro">Montenegro</option>
                    <option value="Noord-Macedonië">Noord-Macedonië</option>
                    <option value="Albanië">Albanië</option>
                    <option value="Kosovo">Kosovo</option>
                    <option value="Malta">Malta</option>
                    <option value="Cyprus">Cyprus</option>
                  </optgroup>
                  <optgroup label="Turkije & Midden-Oosten">
                    <option value="Turkije">Turkije</option>
                    <option value="Marokko">Marokko</option>
                    <option value="Tunesië">Tunesië</option>
                    <option value="Algerije">Algerije</option>
                    <option value="Egypte">Egypte</option>
                    <option value="Libanon">Libanon</option>
                    <option value="Syrië">Syrië</option>
                    <option value="Irak">Irak</option>
                    <option value="Iran">Iran</option>
                    <option value="Saoedi-Arabië">Saoedi-Arabië</option>
                    <option value="Verenigde Arabische Emiraten">Verenigde Arabische Emiraten</option>
                  </optgroup>
                  <optgroup label="Afrika">
                    <option value="Zuid-Afrika">Zuid-Afrika</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Kameroen">Kameroen</option>
                    <option value="Kenia">Kenia</option>
                    <option value="Ethiopië">Ethiopië</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Somalië">Somalië</option>
                  </optgroup>
                  <optgroup label="Azië">
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Indonesië">Indonesië</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Filipijnen">Filipijnen</option>
                    <option value="Japan">Japan</option>
                    <option value="Zuid-Korea">Zuid-Korea</option>
                    <option value="Afghanistan">Afghanistan</option>
                  </optgroup>
                  <optgroup label="Amerika">
                    <option value="Verenigde Staten">Verenigde Staten</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Brazilië">Brazilië</option>
                    <option value="Argentinië">Argentinië</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Curaçao">Curaçao</option>
                    <option value="Aruba">Aruba</option>
                  </optgroup>
                  <optgroup label="Overig">
                    <option value="Australië">Australië</option>
                    <option value="Nieuw-Zeeland">Nieuw-Zeeland</option>
                    <option value="Anders">Anders</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealerPlate">Handelaarskenteken</Label>
                <select
                  id="dealerPlate"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.dealerPlateId}
                  onChange={(e) =>
                    setFormData({ ...formData, dealerPlateId: e.target.value })
                  }
                >
                  <option value="">Geen handelaarskenteken</option>
                  {dealerPlates.map((plate) => (
                    <option key={plate.id} value={plate.id}>
                      {plate.plate}
                    </option>
                  ))}
                </select>
                <Link href="/dashboard/dealer-plates?returnTo=/dashboard/new" className="text-sm text-autoofy-dark hover:underline">
                  Beheer alle handelaarskentekens
                </Link>
                
                {/* Kentekenpas meegegeven checkbox */}
                {formData.dealerPlateId && (
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dealerPlateCardGiven}
                      onChange={(e) =>
                        setFormData({ ...formData, dealerPlateCardGiven: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-autoofy-red focus:ring-autoofy-red"
                    />
                    <span className="text-sm font-medium">Kentekenpas handelaarskenteken fysiek meegegeven aan klant</span>
                  </label>
                )}
              </div>
            </div>

            {/* Verkoper selectie */}
            <div className="space-y-2">
              <Label htmlFor="seller">Verkoper</Label>
              <select
                id="seller"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.sellerId}
                onChange={(e) =>
                  setFormData({ ...formData, sellerId: e.target.value })
                }
              >
                <option value="">Selecteer verkoper...</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
              <Link href="/dashboard/sellers?returnTo=/dashboard/new" className="text-sm text-autoofy-dark hover:underline">
                Beheer verkopers
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Datum *"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
              <TimePicker
                label="Starttijd"
                value={formData.startTime}
                onChange={(value) =>
                  setFormData({ ...formData, startTime: value })
                }
                required
              />
              <TimePicker
                label="Verwachte eindtijd"
                value={formData.endTime}
                onChange={(value) =>
                  setFormData({ ...formData, endTime: value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Startkilometerstand *"
                type="number"
                value={formData.startKm}
                onChange={(e) =>
                  setFormData({ ...formData, startKm: e.target.value })
                }
                required
                min="0"
              />
              <FormInput
                label="Verwachte eindkilometerstand"
                type="number"
                value={formData.endKm}
                onChange={(e) =>
                  setFormData({ ...formData, endKm: e.target.value })
                }
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notities/ eventuele opmerking</label>
              <p className="text-xs text-muted-foreground mb-2">
                Voeg hier eventuele bijzonderheden toe, zoals: schades aan het voertuig, specifieke afspraken, of andere opmerkingen die relevant zijn voor deze proefrit.
              </p>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Bijvoorbeeld: kleine kras op linker portier, klant wil graag langere proefrit, etc."
              />
              
              {/* Schade foto's upload */}
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <label className="text-sm font-medium mb-2 block text-orange-800">
                  📷 Schade foto&apos;s (optioneel)
                </label>
                <p className="text-xs text-orange-700 mb-3">
                  Voeg foto&apos;s toe van bestaande schades aan het voertuig vóór de proefrit.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {damagePhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Schade ${index + 1}`} 
                        className="w-20 h-20 object-cover rounded-lg border-2 border-orange-300"
                      />
                      <button
                        type="button"
                        onClick={() => setDamagePhotos(damagePhotos.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files
                    if (files) {
                      Array.from(files).forEach(file => {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setDamagePhotos(prev => [...prev, event.target!.result as string])
                          }
                        }
                        reader.readAsDataURL(file)
                      })
                    }
                    e.target.value = '' // Reset input
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
                />
                {damagePhotos.length > 0 && (
                  <p className="text-xs text-orange-600 mt-2">{damagePhotos.length} foto('s) toegevoegd</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eigenRisico">Eigen risico *</Label>
                <select
                  id="eigenRisico"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.eigenRisico}
                  onChange={(e) =>
                    setFormData({ ...formData, eigenRisico: e.target.value })
                  }
                  required
                >
                  <option value="0">€0</option>
                  <option value="200">€200</option>
                  <option value="400">€400</option>
                  <option value="600">€600</option>
                  <option value="800">€800</option>
                  <option value="1000">€1000</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aantalSleutels">Aantal sleutels meegegeven *</Label>
                <select
                  id="aantalSleutels"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.aantalSleutels}
                  onChange={(e) =>
                    setFormData({ ...formData, aantalSleutels: e.target.value })
                  }
                  required
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IdPhotoUploadSimple 
                onSave={setIdPhotoFrontUrl} 
                label="Rijbewijs of ID foto voorkant"
              />
              <IdPhotoUploadSimple 
                onSave={setIdPhotoBackUrl} 
                label="Rijbewijs of ID foto achterkant"
              />
            </div>

            <SellerSignature onUse={setSellerSignature} hideReuse={true} />

            <div className="space-y-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ Klant is aansprakelijk voor bekeuringen en schades
                </p>
              </div>
              <CustomerSignature onSave={setCustomerSignature} />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Sticky Submit Button for Mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sticky bottom-0 left-0 right-0 bg-white p-3 -mx-4 -mb-4 md:mb-0 border-t border-slate-200 md:border-t-0 md:static md:bg-transparent md:p-0 md:mx-0 shadow-lg md:shadow-none z-10">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-autoofy-red text-white hover:bg-autoofy-red/90 h-10 text-sm font-medium flex-1 sm:flex-initial"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Opslaan...
                  </>
                ) : (
                  "Proefrit Opslaan"
                )}
              </Button>
              <Link href="/dashboard" className="flex-1 sm:flex-initial">
                <Button type="button" variant="outline" className="w-full h-10 text-sm border-slate-200">
                  Annuleren
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

