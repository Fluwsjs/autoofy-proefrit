/**
 * ID Photo Upload Component with OCR-based Redaction
 * 
 * This component automatically redacts sensitive information from uploaded
 * ID documents using Tesseract.js OCR and pattern matching.
 * 
 * Features:
 * - Client-side OCR processing
 * - BSN detection with elfproef validation
 * - Date of birth detection
 * - MRZ detection
 * - Face/photo redaction (optional)
 * - Watermark overlay
 * - Real-time progress feedback
 */

"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { redactDocumentWithOCR, type DocumentType, type DocumentSide } from "@/lib/redaction"
import { compressImage } from "@/lib/image-security"

interface IdPhotoUploadOCRProps {
  onSave: (photoUrl: string) => void
  initialPhotoUrl?: string
  label?: string
  side?: DocumentSide
  documentType?: DocumentType
  redactBSN?: boolean
  redactDateOfBirth?: boolean
  redactMRZ?: boolean
  redactDocumentNumber?: boolean
  redactFaces?: boolean
  addWatermark?: boolean
}

type ProcessingStage = 'idle' | 'compressing' | 'ocr' | 'redacting' | 'complete' | 'error'

export function IdPhotoUploadOCR({ 
  onSave, 
  initialPhotoUrl, 
  label = "Rijbewijs of ID foto",
  side = 'FRONT',
  documentType = 'ID',
  redactBSN = true,
  redactDateOfBirth = true,
  redactMRZ = true,
  redactDocumentNumber = false,
  redactFaces = false,
  addWatermark = true,
}: IdPhotoUploadOCRProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl || "")
  const [preview, setPreview] = useState<string>(initialPhotoUrl || "")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [detectedItems, setDetectedItems] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Alleen afbeeldingen zijn toegestaan")
      return
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setError("Bestand is te groot. Maximum 10MB toegestaan.")
      return
    }

    setIsProcessing(true)
    setProcessingStage('compressing')
    setError('')
    setDetectedItems([])
    setProcessingProgress(10)

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          let base64String = reader.result as string
          
          // Step 1: Compress image
          console.log('🔄 Compressing image...')
          setProcessingProgress(20)
          base64String = await compressImage(base64String, 1920, 0.85)
          console.log('✅ Image compressed')
          
          // Step 2: Run OCR and redact
          setProcessingStage('ocr')
          setProcessingProgress(30)
          
          console.log('🔍 Starting OCR redaction...')
          const redactionResult = await redactDocumentWithOCR(base64String, {
            documentType,
            side,
            redactBSN,
            redactDateOfBirth,
            redactMRZ,
            redactFaces,
            redactDocumentNumber,
            ocrLanguages: ['nld', 'eng'],
            debug: true,
          })
          
          setProcessingProgress(80)
          setProcessingStage('redacting')
          
          if (!redactionResult.success) {
            throw new Error(redactionResult.errors?.join(', ') || 'Redaction failed')
          }
          
          // Log detected items
          const items: string[] = []
          redactionResult.matches.forEach(match => {
            const itemDesc = `${match.type} (confidence: ${Math.round(match.confidence)}%)`
            items.push(itemDesc)
            console.log(`🔒 Redacted: ${itemDesc}`)
          })
          setDetectedItems(items)
          
          let finalImage = redactionResult.redactedImageBase64!
          
          // Step 3: Add watermark (optional)
          if (addWatermark) {
            console.log('🎨 Adding watermark...')
            finalImage = await addSimpleWatermark(finalImage)
          }
          
          setProcessingProgress(100)
          setProcessingStage('complete')
          
          // Save result
          setPhotoUrl(finalImage)
          setPreview(finalImage)
          onSave(finalImage)
          
          console.log(`✅ Processing complete! Redacted ${redactionResult.matches.length} item(s) in ${Math.round(redactionResult.processingTimeMs)}ms`)
          
        } catch (error) {
          console.error("❌ Error processing image:", error)
          setError(error instanceof Error ? error.message : 'Er is een fout opgetreden')
          setProcessingStage('error')
        } finally {
          setIsProcessing(false)
        }
      }
      
      reader.onerror = () => {
        setError("Er is een fout opgetreden bij het lezen van het bestand.")
        setProcessingStage('error')
        setIsProcessing(false)
      }
      
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error("❌ Error reading file:", error)
      setError("Er is een fout opgetreden bij het lezen van het bestand.")
      setProcessingStage('error')
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setPhotoUrl("")
    setPreview("")
    setError("")
    setDetectedItems([])
    setProcessingStage('idle')
    onSave("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const getStageMessage = (): string => {
    switch (processingStage) {
      case 'compressing':
        return 'Foto comprimeren...'
      case 'ocr':
        return 'OCR analyse (dit kan even duren)...'
      case 'redacting':
        return 'Gevoelige informatie afschermen...'
      case 'complete':
        return 'Klaar!'
      case 'error':
        return 'Fout opgetreden'
      default:
        return 'Bezig...'
    }
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {redactBSN && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Shield className="h-3 w-3" />
              <span>BSN OCR</span>
            </div>
          )}
          {redactDateOfBirth && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Shield className="h-3 w-3" />
              <span>Geboortedatum</span>
            </div>
          )}
          {redactDocumentNumber && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Shield className="h-3 w-3" />
              <span>Rijbewijsnummer</span>
            </div>
          )}
          {addWatermark && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Shield className="h-3 w-3" />
              <span>Watermerk</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="border rounded-md p-4 bg-white">
        {/* Processing State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-blue-50/50">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
            <p className="text-base font-semibold text-blue-900 mb-2">
              {getStageMessage()}
            </p>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <p className="text-sm text-blue-700">{processingProgress}%</p>
            
            {processingStage === 'ocr' && (
              <p className="text-xs text-blue-600 mt-4 max-w-xs text-center">
                ℹ️ OCR analyse kan 10-30 seconden duren. Even geduld...
              </p>
            )}
          </div>
        )}

        {/* Preview State */}
        {!isProcessing && preview && (
          <div className="relative">
            <div className="relative w-full h-64 border rounded overflow-hidden bg-muted">
              <Image
                src={preview}
                alt="Redacted document preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            
            {/* Success Message */}
            {processingStage === 'complete' && detectedItems.length > 0 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-semibold text-green-900 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Beveiligd! Afgeschermde items:
                </p>
                <ul className="list-disc list-inside text-xs text-green-800 space-y-1">
                  {detectedItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* No Items Detected Warning */}
            {processingStage === 'complete' && detectedItems.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Geen gevoelige informatie gedetecteerd. Controleer of de foto duidelijk en goed leesbaar is.</span>
                </p>
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="mt-2 w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Foto verwijderen
            </Button>
          </div>
        )}

        {/* Upload State */}
        {!isProcessing && !preview && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-base font-semibold text-foreground mb-2">
              Klik om document te uploaden
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximaal 10MB, JPG, PNG of GIF
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 max-w-md">
              <p className="text-xs font-semibold text-blue-900 mb-2">
                🤖 Automatische OCR Beveiliging:
              </p>
              <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
                {redactBSN && <li>BSN nummers (met elfproef validatie)</li>}
                {redactDateOfBirth && <li>Geboortedatum</li>}
                {redactDocumentNumber && <li>Rijbewijsnummer (punt 5)</li>}
                {redactMRZ && <li>MRZ (Machine Readable Zone)</li>}
                {redactFaces && <li>Gezichtsfoto</li>}
                {addWatermark && <li>Watermerk "AUTOOFY - ALLEEN VERIFICATIE"</li>}
              </ul>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleClick}
              disabled={isProcessing}
            >
              <Upload className="h-5 w-5 mr-2" />
              Foto selecteren
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Simple watermark function (reusing existing logic)
 */
async function addSimpleWatermark(base64Image: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Add diagonal watermark
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#B22234'
      ctx.font = 'bold 40px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((-45 * Math.PI) / 180)
      
      const text = 'AUTOOFY - ALLEEN VERIFICATIE'
      const spacing = 200
      for (let row = -3; row < 3; row++) {
        for (let col = -3; col < 3; col++) {
          ctx.fillText(text, col * spacing, row * spacing)
        }
      }
      
      ctx.restore()
      
      const watermarkedImage = canvas.toDataURL('image/jpeg', 0.92)
      resolve(watermarkedImage)
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = base64Image
  })
}

