"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { useSession } from "next-auth/react"
import { Shield, CheckCircle, Smartphone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { FormInput } from "@/components/FormInput"
import Image from "next/image"
import QRCode from "qrcode"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { showToast, ToastComponent } = useToast()
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  // We assume the user's session needs to be refreshed to know if 2FA is enabled, 
  // but currently our session object doesn't include this flag. 
  // For MVP we'll just track local state after enabling/disabling.
  const [is2FAEnabled, setIs2FAEnabled] = useState(false) // In a real app, fetch this from server

  // Fetch 2FA status on mount (simplified)
  // In a real app, you'd have an API endpoint /api/user/me returning this status

  const start2FASetup = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        if (data.otpauth) {
          const qrCodeUrl = await QRCode.toDataURL(data.otpauth)
          setQrCode(qrCodeUrl)
          setSecret(data.secret)
          setIs2FAModalOpen(true)
        }
      } else {
        showToast("Fout bij starten 2FA setup", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable2FA = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (res.ok) {
        setIs2FAEnabled(true)
        setIs2FAModalOpen(false)
        showToast("Twee-factor authenticatie is geactiveerd!", "success")
        setVerificationCode("")
      } else {
        const data = await res.json()
        showToast(data.error || "Ongeldige code", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm("Weet u zeker dat u 2FA wilt uitschakelen? Uw account is dan minder goed beveiligd.")) return

    setLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/disable", { method: "POST" })
      if (res.ok) {
        setIs2FAEnabled(false)
        showToast("Twee-factor authenticatie is uitgeschakeld", "success")
      } else {
        showToast("Fout bij uitschakelen 2FA", "error")
      }
    } catch (error) {
      showToast("Er is een fout opgetreden", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {ToastComponent}
      
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-autoofy-dark">Mijn Profiel</h1>
          <p className="text-muted-foreground">Beheer uw accountinstellingen en beveiliging</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Persoonlijke Informatie</CardTitle>
            <CardDescription>Uw accountgegevens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Naam</p>
              <p className="text-lg font-semibold">{session?.user?.name}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">E-mailadres</p>
              <p className="text-lg font-semibold">{session?.user?.email}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Rol</p>
              <p className="text-lg font-semibold capitalize">
                {(session?.user as any)?.role?.toLowerCase() || "Medewerker"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={is2FAEnabled ? "border-green-200 bg-green-50/30" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-autoofy-dark" />
                  Twee-Factor Authenticatie
                </CardTitle>
                <CardDescription>
                  Extra beveiliging voor uw account
                </CardDescription>
              </div>
              {is2FAEnabled && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Actief
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bescherm uw account tegen ongeautoriseerde toegang door een extra verificatiestap toe te voegen.
                U heeft een authenticatie-app nodig (zoals Google Authenticator of Microsoft Authenticator).
              </p>
              
              {is2FAEnabled ? (
                <Button 
                  variant="destructive" 
                  onClick={disable2FA} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Bezig..." : "2FA Uitschakelen"}
                </Button>
              ) : (
                <Button 
                  onClick={start2FASetup} 
                  disabled={loading}
                  className="w-full bg-autoofy-dark hover:bg-autoofy-dark/90"
                >
                  {loading ? "Bezig..." : "2FA Activeren"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>2FA Instellen</DialogTitle>
            <DialogDescription>
              Scan de QR-code met uw authenticatie-app en voer de code in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            {qrCode && (
              <div className="p-4 bg-white rounded-lg border shadow-sm">
                <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
              </div>
            )}
            
            <div className="w-full space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Kunt u de code niet scannen? Voer deze sleutel handmatig in:
                </p>
                <code className="px-2 py-1 bg-muted rounded text-sm font-mono select-all">
                  {secret}
                </code>
              </div>

              <div className="space-y-2">
                <FormInput
                  label="Verificatiecode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIs2FAModalOpen(false)}>
              Annuleren
            </Button>
            <Button 
              onClick={verifyAndEnable2FA} 
              disabled={loading || verificationCode.length !== 6}
              className="bg-autoofy-dark hover:bg-autoofy-dark/90"
            >
              {loading ? "Verifiëren..." : "Verifiëren & Activeren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

