/**
 * Simple ID Photo Upload with Bottom Bar Redaction
 * 
 * Ultra-simple approach:
 * 1. Watermark over entire photo
 * 2. Black bar at bottom covering all sensitive numbers (BSN, license number, MRZ)
 * 
 * Fast, reliable, and privacy-friendly.
 */

"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon, Shield, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { compressImage } from "@/lib/image-security"

interface IdPhotoUploadSimpleProps {
  onSave: (photoUrl: string) => void
  initialPhotoUrl?: string
  label?: string
}

export function IdPhotoUploadSimple({ 
  onSave, 
  initialPhotoUrl, 
  label = "Rijbewijs of ID foto",
}: IdPhotoUploadSimpleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl || "")
  const [preview, setPreview] = useState<string>(initialPhotoUrl || "")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Alleen afbeeldingen zijn toegestaan")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Bestand is te groot. Maximum 10MB toegestaan.")
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          let base64String = reader.result as string
          
          base64String = await compressImage(base64String, 1920, 0.85)
          const redacted = await addBottomBlackBar(base64String)
          const watermarked = await addWatermark(redacted)
          
          setPhotoUrl(watermarked)
          setPreview(watermarked)
          onSave(watermarked)
          
        } catch (error) {
          console.error("Error:", error)
          setError(error instanceof Error ? error.message : 'Fout opgetreden')
        } finally {
          setIsProcessing(false)
        }
      }
      
      reader.onerror = () => {
        setError("Fout bij lezen bestand")
        setIsProcessing(false)
      }
      
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error("Error:", error)
      setError("Fout opgetreden")
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setPhotoUrl("")
    setPreview("")
    setError("")
    onSave("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {photoUrl && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Shield className="h-3 w-3" />
            <span>Beveiligd</span>
          </div>
        )}
      </div>

      <div className="border rounded-md p-4 bg-white">
        {isProcessing && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-blue-50/50">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
            <p className="text-base font-semibold text-blue-900">
              Foto beveiligen...
            </p>
            <p className="text-sm text-blue-700 mt-2">Snel en betrouwbaar</p>
          </div>
        )}

        {!isProcessing && preview && (
          <div className="relative">
            <div className="relative w-full h-64 border rounded overflow-hidden bg-muted">
              <Image
                src={preview}
                alt="Beveiligde foto"
                fill
                className="object-contain"
                unoptimized
              />
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
        )}

        {!isProcessing && !preview && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-base font-semibold text-foreground mb-2">
              Klik om document te uploaden
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximaal 10MB, JPG, PNG of GIF
            </p>
            
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5 mr-2" />
              Foto selecteren
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Add a large black bar at the bottom covering all sensitive numbers
 * Simple and effective - covers BSN, license number, document number, MRZ
 */
async function addBottomBlackBar(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Draw LARGE BLACK BAR at bottom
      // Covers bottom 25% of the image - enough to cover all numbers
      const barHeight = canvas.height * 0.25  // 25% of image height
      const barY = canvas.height * 0.75        // Start at 75% from top
      
      ctx.fillStyle = '#000000'
      ctx.globalAlpha = 1.0
      ctx.fillRect(0, barY, canvas.width, barHeight)
      
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageBase64
  })
}

/**
 * Add watermark
 */
async function addWatermark(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Diagonal watermark
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#B22234'
      ctx.font = 'bold 40px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((-45 * Math.PI) / 180)
      
      const text = 'AUTOOFY - ALLEEN VERIFICATIE'
      for (let row = -3; row < 3; row++) {
        for (let col = -3; col < 3; col++) {
          ctx.fillText(text, col * 250, row * 200)
        }
      }
      
      ctx.restore()
      
      // Red border
      ctx.strokeStyle = '#B22234'
      ctx.lineWidth = 8
      ctx.globalAlpha = 0.6
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
      
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageBase64
  })
}

