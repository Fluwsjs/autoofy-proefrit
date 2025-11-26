"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, Shield } from "lucide-react"
import Image from "next/image"
import { processIdPhoto, compressImage, getBase64ImageSize } from "@/lib/image-security"

interface IdPhotoUploadProps {
  onSave: (photoUrl: string) => void
  initialPhotoUrl?: string
  label?: string
  side?: 'FRONT' | 'BACK'
  documentType?: 'ID' | 'DRIVERS_LICENSE'
  redactBsn?: boolean
}

export function IdPhotoUpload({ 
  onSave, 
  initialPhotoUrl, 
  label = "Rijbewijs of ID foto",
  side = 'FRONT',
  documentType = 'ID',
  redactBsn = true
}: IdPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl || "")
  const [preview, setPreview] = useState<string>(initialPhotoUrl || "")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Alleen afbeeldingen zijn toegestaan")
      return
    }

    // Check file size (max 10MB before processing)
    if (file.size > 10 * 1024 * 1024) {
      alert("Bestand is te groot. Maximum 10MB toegestaan.")
      return
    }

    setIsProcessing(true)

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          let base64String = reader.result as string

          // Compress image first to reduce size
          base64String = await compressImage(base64String, 1920, 0.85)

          // Add watermark and redact BSN for security (with intelligent detection!)
          const processedImage = await processIdPhoto(base64String, {
            addWatermark: true,
            redactBsn: redactBsn,
            useIntelligentDetection: true,  // 🎯 NEW: Smart BSN detection
            documentType: documentType,
            side: side,
          })

          // Check final size
          const finalSize = getBase64ImageSize(processedImage)
          if (finalSize > 5) {
            // If still too large, compress more aggressively
            base64String = await compressImage(base64String, 1280, 0.75)
            const reprocessedImage = await processIdPhoto(base64String, {
              addWatermark: true,
              redactBsn: redactBsn,
              useIntelligentDetection: true,  // 🎯 NEW: Smart BSN detection
              documentType: documentType,
              side: side,
            })
            setPhotoUrl(reprocessedImage)
            setPreview(reprocessedImage)
            onSave(reprocessedImage)
          } else {
            setPhotoUrl(processedImage)
            setPreview(processedImage)
            onSave(processedImage)
          }
        } catch (error) {
          console.error("Error processing image:", error)
          alert("Er is een fout opgetreden bij het verwerken van de foto. Probeer een andere foto.")
        } finally {
          setIsProcessing(false)
        }
      }
      reader.onerror = () => {
        alert("Er is een fout opgetreden bij het lezen van het bestand.")
        setIsProcessing(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error reading file:", error)
      alert("Er is een fout opgetreden bij het lezen van het bestand.")
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setPhotoUrl("")
    setPreview("")
    onSave("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {redactBsn && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Shield className="h-3 w-3" />
              <span>BSN intelligent gedetecteerd</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Shield className="h-3 w-3" />
            <span>Watermerk</span>
          </div>
        </div>
      </div>
      <div className="border rounded-md p-4 bg-white">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B22234] mb-4"></div>
            <p className="text-sm text-muted-foreground mb-1">
              Foto beveiligen...
            </p>
            <p className="text-xs text-muted-foreground">
              {redactBsn ? '🎯 BSN intelligent detecteren en afschermen, watermerk toevoegen' : 'Watermerk toevoegen en optimaliseren'}
            </p>
          </div>
        ) : preview ? (
          <div className="relative">
            <div className="relative w-full h-48 border rounded overflow-hidden bg-muted">
              <Image
                src={preview}
                alt="Rijbewijs of ID foto preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-800 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>
                  {redactBsn 
                    ? '🎯 BSN intelligent gedetecteerd en afgeschermd + watermerk toegevoegd'
                    : 'Deze foto is beveiligd met een watermerk voor bescherming van klantgegevens'
                  }
                </span>
              </p>
            </div>
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
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Klik om rijbewijs of ID foto te uploaden
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Maximaal 10MB, JPG, PNG of GIF
            </p>
            <div className="space-y-1 mb-3">
              {redactBsn && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Shield className="h-3 w-3" />
                  <span>🎯 BSN wordt intelligent gedetecteerd en afgeschermd</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Shield className="h-3 w-3" />
                <span>Automatische beveiliging met watermerk</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              className="mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Foto selecteren
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

