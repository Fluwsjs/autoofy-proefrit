"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface CustomerSignatureProps {
  onSave: (signature: string) => void
  initialSignature?: string
}

export function CustomerSignature({ onSave, initialSignature }: CustomerSignatureProps) {
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(!initialSignature)
  const [hasSignature, setHasSignature] = useState(!!initialSignature)

  const handleClear = () => {
    signatureRef.current?.clear()
    setIsEmpty(true)
    setHasSignature(false)
    onSave("")
  }

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signature = signatureRef.current.getTrimmedCanvas().toDataURL("image/png")
      onSave(signature)
      setIsEmpty(false)
      setHasSignature(true)
    }
  }

  const handleEnd = () => {
    // Auto-save when user finishes drawing
    setTimeout(() => {
      handleSave()
    }, 100)
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <div className="space-y-2">
      <Label>Klant handtekening</Label>
      <div className="border rounded-md p-2 sm:p-4 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            width: typeof window !== 'undefined' ? Math.min(600, Math.max(280, window.innerWidth - 80)) : 500,
            height: 200,
            className: "signature-canvas w-full h-40 sm:h-48 border rounded cursor-crosshair touch-none",
          }}
          onEnd={handleEnd}
          onBegin={handleBegin}
        />
        {initialSignature && !isEmpty && (
          <div className="mt-2">
            <img
              src={initialSignature}
              alt="Handtekening preview"
              className="max-w-full h-24 object-contain border rounded"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty && !hasSignature}
        >
          Wissen
        </Button>
        {hasSignature && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            ✓ Handtekening opgeslagen
          </span>
        )}
      </div>
    </div>
  )
}

