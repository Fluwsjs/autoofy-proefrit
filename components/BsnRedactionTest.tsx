"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Shield, Eye } from "lucide-react"
import Image from "next/image"
import { processIdPhoto, compressImage } from "@/lib/image-security"

/**
 * Test component to visualize BSN redaction
 * Shows before/after comparison
 */
export function BsnRedactionTest() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [originalImage, setOriginalImage] = useState<string>("")
  const [processedImage, setProcessedImage] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingLog, setProcessingLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setProcessingLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Alleen afbeeldingen toegestaan")
      return
    }

    setIsProcessing(true)
    setProcessingLog([])
    addLog("📁 Bestand geselecteerd")

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          let base64String = reader.result as string
          setOriginalImage(base64String)
          addLog("✅ Origineel geladen")

          // Compress
          addLog("🔄 Comprimeren...")
          base64String = await compressImage(base64String, 1920, 0.85)
          addLog("✅ Gecomprimeerd")

          // Process with intelligent detection
          addLog("🎯 Intelligente BSN detectie starten...")
          const processed = await processIdPhoto(base64String, {
            addWatermark: true,
            redactBsn: true,
            useIntelligentDetection: true,
            documentType: 'ID',
            side: 'FRONT',
          })
          
          setProcessedImage(processed)
          addLog("✅ Verwerking compleet!")
          addLog("🔒 BSN zou nu afgeschermd moeten zijn")
        } catch (error) {
          console.error(error)
          addLog(`❌ ERROR: ${error}`)
          alert("Fout bij verwerken")
        } finally {
          setIsProcessing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error(error)
      addLog(`❌ ERROR: ${error}`)
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-600" />
          BSN Redactie Test
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Test of BSN nummers correct worden afgeschermd
        </p>
      </div>

      {/* Upload */}
      <div className="space-y-2">
        <Label>Test Foto Uploaden</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isProcessing ? "Bezig met verwerken..." : "Selecteer Test Foto"}
        </Button>
      </div>

      {/* Processing Log */}
      {processingLog.length > 0 && (
        <div className="bg-slate-50 border rounded p-3 space-y-1">
          <div className="font-semibold text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Verwerkingslog:
          </div>
          <div className="text-xs font-mono space-y-0.5 max-h-32 overflow-y-auto">
            {processingLog.map((log, i) => (
              <div key={i} className="text-slate-700">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison */}
      {originalImage && processedImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="space-y-2">
            <Label className="text-red-600 font-semibold">
              ❌ VOOR (Origineel - BSN ZICHTBAAR)
            </Label>
            <div className="border-2 border-red-300 rounded-lg overflow-hidden bg-red-50">
              <div className="relative w-full h-64">
                <Image
                  src={originalImage}
                  alt="Voor redactie"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800">
              ⚠️ BSN nummer is hier nog zichtbaar
            </div>
          </div>

          {/* After */}
          <div className="space-y-2">
            <Label className="text-green-600 font-semibold">
              ✅ NA (Beveiligd - BSN AFGESCHERMD)
            </Label>
            <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-green-50">
              <div className="relative w-full h-64">
                <Image
                  src={processedImage}
                  alt="Na redactie"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
              ✅ BSN nummer moet hier zwart zijn
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm space-y-2">
        <div className="font-semibold text-blue-900">
          📋 Test Instructies:
        </div>
        <ol className="list-decimal list-inside text-blue-800 space-y-1">
          <li>Upload een test ID of rijbewijs foto</li>
          <li>Wacht tot verwerking klaar is</li>
          <li>Vergelijk VOOR en NA</li>
          <li>Check of BSN nummer zwart is in de NA foto</li>
          <li>Als BSN nog zichtbaar is, is er een probleem!</li>
        </ol>
      </div>
    </div>
  )
}

