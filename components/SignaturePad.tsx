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
      <div className="flex gap-2 items-center mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty && !hasSignature}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
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

