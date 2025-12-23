"use client"

import { useRef, useState, useEffect } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/toast"

interface SellerSignatureProps {
  onUse: (signatureUrl: string) => void
  hideReuse?: boolean // Verberg opgeslagen handtekening functionaliteit
}

export function SellerSignature({ onUse, hideReuse = false }: SellerSignatureProps) {
  const { data: session } = useSession()
  const { showToast, ToastComponent } = useToast()
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [savedSignature, setSavedSignature] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load saved signature on mount (alleen als hideReuse false is)
  useEffect(() => {
    if (session?.user?.id && !hideReuse) {
      fetchSellerSignature()
    } else if (hideReuse) {
      setLoading(false)
    }
  }, [session, hideReuse])

  const fetchSellerSignature = async () => {
    try {
      const response = await fetch("/api/user/seller-signature")
      if (response.ok) {
        const data = await response.json()
        if (data.signatureUrl) {
          setSavedSignature(data.signatureUrl)
          setIsEmpty(false)
          onUse(data.signatureUrl)
        }
      }
    } catch (error) {
      console.error("Error fetching seller signature:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    signatureRef.current?.clear()
    setIsEmpty(true)
  }

  const handleEnd = () => {
    setIsEmpty(false)
    
    // Als hideReuse true is, gebruik de handtekening automatisch
    if (hideReuse && signatureRef.current && !signatureRef.current.isEmpty()) {
      const signature = signatureRef.current.getTrimmedCanvas().toDataURL("image/png")
      onUse(signature)
    }
  }

  const handleSave = async () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signature = signatureRef.current.getTrimmedCanvas().toDataURL("image/png")
      
      setSaving(true)
      try {
        const response = await fetch("/api/user/seller-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signatureUrl: signature }),
        })

        if (response.ok) {
          setSavedSignature(signature)
          setIsEmpty(false)
          onUse(signature)
          showToast("Verkoper handtekening opgeslagen", "success")
        } else {
          showToast("Fout bij opslaan handtekening", "error")
        }
      } catch (error) {
        console.error("Error saving seller signature:", error)
        showToast("Fout bij opslaan handtekening", "error")
      } finally {
        setSaving(false)
      }
    }
  }

  const handleUseSaved = () => {
    if (savedSignature) {
      onUse(savedSignature)
      showToast("Verkoper handtekening gebruikt", "success")
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Verkoper handtekening/stempel</Label>
        <div className="border rounded-md p-4 bg-white">
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {ToastComponent}
      <Label>Verkoper handtekening/stempel</Label>
      
      {savedSignature && !hideReuse ? (
        <div className="space-y-4">
          <div className="border rounded-md p-4 bg-white">
            <p className="text-sm font-medium mb-2">Opgeslagen handtekening:</p>
            <div className="border rounded p-2 bg-muted/30">
              <img
                src={savedSignature}
                alt="Opgeslagen verkoper handtekening"
                className="max-w-full h-24 object-contain"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleUseSaved}
                className="bg-autoofy-red text-white hover:bg-autoofy-red/90"
              >
                Gebruik opgeslagen handtekening
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Of teken een nieuwe handtekening:</p>
            <div className="border rounded-md p-2 sm:p-4 bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: typeof window !== 'undefined' ? Math.min(600, Math.max(280, window.innerWidth - 80)) : 500,
                  height: 200,
                  className: "signature-canvas w-full h-40 sm:h-48 border rounded cursor-crosshair touch-none",
                }}
                onEnd={handleEnd}
                onBegin={() => setIsEmpty(false)}
              />
              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={isEmpty}
                >
                  Wissen
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isEmpty || saving}
                  className="bg-autoofy-red text-white hover:bg-autoofy-red/90"
                >
                  {saving ? "Opslaan..." : "Nieuwe handtekening opslaan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-2 sm:p-4 bg-white">
          <p className="text-sm text-muted-foreground mb-4">
            {hideReuse 
              ? "Teken hieronder uw handtekening of stempel."
              : "Teken hieronder uw handtekening of stempel. Deze wordt opgeslagen en kan worden hergebruikt."
            }
          </p>
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: typeof window !== 'undefined' ? Math.min(600, Math.max(280, window.innerWidth - 80)) : 500,
              height: 200,
              className: "signature-canvas w-full h-40 sm:h-48 border rounded cursor-crosshair touch-none",
            }}
            onEnd={handleEnd}
            onBegin={() => setIsEmpty(false)}
          />
          {!hideReuse && (
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isEmpty}
              >
                Wissen
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isEmpty || saving}
                className="bg-autoofy-dark text-white hover:bg-autoofy-dark/90"
              >
                {saving ? "Opslaan..." : "Handtekening opslaan"}
              </Button>
            </div>
          )}
          {hideReuse && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isEmpty}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Wissen
              </Button>
              {!isEmpty && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Handtekening toegevoegd
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

