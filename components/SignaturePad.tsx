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

  const handleClear = () => {
    signatureRef.current?.clear()
    setIsEmpty(true)
    onSave("")
  }

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signature = signatureRef.current.getTrimmedCanvas().toDataURL("image/png")
      onSave(signature)
      setIsEmpty(false)
    }
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
            className: "signature-canvas w-full h-48 border rounded",
          }}
          onEnd={handleSave}
          onBegin={handleBegin}
        />
        {initialSignature && (
          <img
            src={initialSignature}
            alt="Handtekening"
            className="mt-2 max-w-full h-24 object-contain"
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
        >
          Wissen
        </Button>
        {!isEmpty && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSave}
          >
            Opslaan
          </Button>
        )}
      </div>
    </div>
  )
}

