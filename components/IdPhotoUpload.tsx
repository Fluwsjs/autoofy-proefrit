"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface IdPhotoUploadProps {
  onSave: (photoUrl: string) => void
  initialPhotoUrl?: string
}

export function IdPhotoUpload({ onSave, initialPhotoUrl }: IdPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl || "")
  const [preview, setPreview] = useState<string>(initialPhotoUrl || "")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Alleen afbeeldingen zijn toegestaan")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Bestand is te groot. Maximum 5MB toegestaan.")
      return
    }

    // Read file as base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setPhotoUrl(base64String)
      setPreview(base64String)
      onSave(base64String)
    }
    reader.readAsDataURL(file)
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
      <Label>ID Foto</Label>
      <div className="border rounded-md p-4 bg-white">
        {preview ? (
          <div className="relative">
            <div className="relative w-full h-48 border rounded overflow-hidden bg-muted">
              <Image
                src={preview}
                alt="ID Foto preview"
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
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Klik om ID foto te uploaden
            </p>
            <p className="text-xs text-muted-foreground">
              Maximaal 5MB, JPG, PNG of GIF
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
              variant="outline"
              size="sm"
              onClick={handleClick}
              className="mt-4"
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

