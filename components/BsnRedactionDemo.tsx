"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff } from "lucide-react"
import { BSN_REDACTION_ZONES } from "@/lib/image-security"

/**
 * Demo component to visualize BSN redaction zones
 * Shows where redaction boxes will be placed on ID photos
 */
export function BsnRedactionDemo() {
  const [selectedDoc, setSelectedDoc] = useState<keyof typeof BSN_REDACTION_ZONES>('ID_FRONT_NL')
  const [showZones, setShowZones] = useState(true)

  const docTypes = [
    { key: 'ID_FRONT_NL' as const, label: 'ID Voorkant' },
    { key: 'ID_BACK_NL' as const, label: 'ID Achterkant' },
    { key: 'DRIVERS_LICENSE_FRONT_NL' as const, label: 'Rijbewijs Voorkant' },
    { key: 'DRIVERS_LICENSE_BACK_NL' as const, label: 'Rijbewijs Achterkant' },
  ]

  const zones = BSN_REDACTION_ZONES[selectedDoc]

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold">BSN Redactie Zones Visualisatie</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Bekijk waar BSN nummers automatisch worden afgeschermd per documenttype
        </p>
      </div>

      {/* Document Type Selector */}
      <div className="flex flex-wrap gap-2">
        {docTypes.map(({ key, label }) => (
          <Button
            key={key}
            variant={selectedDoc === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDoc(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Toggle Zones Visibility */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowZones(!showZones)}
        >
          {showZones ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Zones Verbergen
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Zones Tonen
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {showZones ? 'Rode zones tonen waar BSN wordt afgeschermd' : 'Klik om zones te tonen'}
        </span>
      </div>

      {/* Visualization Area */}
      <div className="border-2 border-dashed rounded-lg p-4 bg-slate-50">
        <div className="relative w-full" style={{ paddingBottom: '63%' }}>
          {/* Document Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-md border-2 border-blue-200 shadow-lg">
            {/* Mock Document Content */}
            <div className="p-4 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-bold text-blue-900">
                  {selectedDoc.includes('DRIVERS') ? 'RIJBEWIJS' : 'IDENTITEITSKAART'}
                </div>
                <div className="text-xs text-blue-700">Nederland</div>
              </div>
              
              <div className="space-y-1 text-xs text-blue-700">
                <div>Naam: Jan Jansen</div>
                <div>Geboren: 01-01-1990</div>
                <div className="text-red-600 font-semibold">BSN: 123456789 ← Dit wordt afgeschermd</div>
              </div>
            </div>

            {/* Redaction Zones Overlay */}
            {showZones && zones.map((zone, index) => (
              <div
                key={index}
                className="absolute bg-red-500/40 border-2 border-red-600 rounded animate-pulse"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Zone {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Info */}
        {showZones && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Shield className="h-4 w-4 text-red-600" />
              Redactie Zones voor {docTypes.find(d => d.key === selectedDoc)?.label}:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {zones.map((zone, index) => (
                <div key={index} className="bg-white border border-red-200 rounded p-2 text-xs">
                  <div className="font-semibold text-red-700">Zone {index + 1}</div>
                  <div className="text-slate-600 mt-1 space-y-0.5">
                    <div>X: {zone.x}% | Y: {zone.y}%</div>
                    <div>Breedte: {zone.width}% | Hoogte: {zone.height}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-blue-900">
              Automatische BSN Beveiliging
            </p>
            <p className="text-blue-700">
              Alle geuploade foto's worden automatisch beveiligd met zwarte balken op deze zones.
              Dit gebeurt <strong>voordat</strong> de foto wordt opgeslagen, zodat BSN nummers
              nooit in het systeem terechtkomen.
            </p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Meerdere zones voor maximale coverage</li>
              <li>Werkt op alle resoluties (percentages)</li>
              <li>Permanent en niet omkeerbaar</li>
              <li>Aangevuld met watermerk beveiliging</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

