"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface SignaturePadProps {
  onSave: (signature: string) => void
  initialSignature?: string
}

export function SignaturePad({ onSave, initialSignature }: SignaturePadProps) {
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
      <Label>Handtekening</Label>
      <div className="border rounded-md p-4 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            width: 500,
            height: 200,
            className: "signature-canvas w-full h-48 border rounded cursor-crosshair",
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

