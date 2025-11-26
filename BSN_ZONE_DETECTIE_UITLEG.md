# 🎯 Hoe Weet het Systeem Waar BSN Staat?

## Quick Answer

Het systeem weet het **niet automatisch** - jij vertelt het! Via de `documentType` en `side` parameters kiest het systeem de juiste voorgedefinieerde zones.

## 🔄 Volledige Flow

### Stap 1: Component Gebruik (Jij vertelt het!)

In `app/dashboard/new/page.tsx`:

```typescript
<IdPhotoUpload 
  onSave={setIdPhotoFrontUrl} 
  label="Rijbewijs of ID foto voorkant"
  side="FRONT"              // ← JIJ VERTELT: Dit is de voorkant
  documentType="ID"          // ← JIJ VERTELT: Dit is een ID kaart
  redactBsn={true}          // ← JIJ VERTELT: Scherm BSN af
/>
```

**Als het een rijbewijs was geweest:**
```typescript
<IdPhotoUpload 
  documentType="DRIVERS_LICENSE"  // ← Dan andere zones!
  side="FRONT"
/>
```

### Stap 2: Component Ontvangt Info

In `components/IdPhotoUpload.tsx`:

```typescript
export function IdPhotoUpload({ 
  onSave, 
  initialPhotoUrl, 
  label,
  side = 'FRONT',                    // ← Ontvangt: FRONT
  documentType = 'ID',                // ← Ontvangt: ID
  redactBsn = true                    // ← Ontvangt: true
}: IdPhotoUploadProps) {
  
  // Bij upload:
  const processedImage = await processIdPhoto(base64String, {
    addWatermark: true,
    redactBsn: redactBsn,            // true
    documentType: documentType,       // "ID"
    side: side,                       // "FRONT"
  })
}
```

### Stap 3: processIdPhoto Functie

In `lib/image-security.ts`:

```typescript
export async function processIdPhoto(
  base64Image: string,
  options: {
    documentType?: 'ID' | 'DRIVERS_LICENSE'  // ← Ontvangt: "ID"
    side?: 'FRONT' | 'BACK'                   // ← Ontvangt: "FRONT"
    redactBsn?: boolean                       // ← Ontvangt: true
  }
) {
  const { documentType = 'ID', side = 'FRONT', redactBsn = true } = options
  
  // Haal de juiste zones op:
  if (redactBsn) {
    redactionBoxes = getBsnRedactionZones(documentType, side)
    //                                     ↓            ↓
    //                                    "ID"      "FRONT"
  }
}
```

### Stap 4: Zone Selectie

```typescript
export function getBsnRedactionZones(
  documentType: 'ID' | 'DRIVERS_LICENSE',  // ← Ontvangt: "ID"
  side: 'FRONT' | 'BACK'                   // ← Ontvangt: "FRONT"
) {
  // Maak de key: "ID_FRONT_NL"
  const key = `${documentType}_${side}_NL`  // "ID_FRONT_NL"
  
  // Zoek in de zone definitie:
  return BSN_REDACTION_ZONES[key]
  //     ↓
  //     BSN_REDACTION_ZONES["ID_FRONT_NL"]
  //     ↓
  //     [
  //       { x: 5, y: 75, width: 45, height: 8 },
  //       { x: 55, y: 75, width: 40, height: 8 },
  //     ]
}
```

### Stap 5: Zones Toepassen

```typescript
// Deze zones worden dan gebruikt om zwarte balken te plaatsen:
await addRedactionBoxes(image, [
  { x: 5, y: 75, width: 45, height: 8 },    // Zwarte balk 1
  { x: 55, y: 75, width: 40, height: 8 },   // Zwarte balk 2
])
```

## 📊 Visuele Flow

```
Upload Formulier
    ↓
"Dit is een ID voorkant" (via props)
    ↓
Component krijgt: documentType="ID", side="FRONT"
    ↓
processIdPhoto() ontvangt deze info
    ↓
getBsnRedactionZones("ID", "FRONT")
    ↓
Zoekt in BSN_REDACTION_ZONES["ID_FRONT_NL"]
    ↓
Geeft terug: [zone1, zone2]
    ↓
addRedactionBoxes() plaatst zwarte balken op deze zones
    ↓
✅ BSN afgeschermd op de juiste plek!
```

## 🎯 Verschillende Documenttypes

### ID Kaart Zones

**Voorkant:**
```typescript
ID_FRONT_NL: [
  { x: 5%, y: 75%, width: 45%, height: 8% },   // Linksonder
  { x: 55%, y: 75%, width: 40%, height: 8% },  // Rechtsonder
]
```

**Achterkant:**
```typescript
ID_BACK_NL: [
  { x: 5%, y: 15%, width: 45%, height: 8% },   // Bovenkant
  { x: 5%, y: 75%, width: 45%, height: 8% },   // Linksonder
  { x: 55%, y: 75%, width: 40%, height: 8% },  // Rechtsonder
]
```

### Rijbewijs Zones (Andere Posities!)

**Voorkant:**
```typescript
DRIVERS_LICENSE_FRONT_NL: [
  { x: 5%, y: 70%, width: 45%, height: 10% },  // Punt 5 links (HOGER!)
  { x: 55%, y: 70%, width: 40%, height: 10% }, // Punt 5 rechts (HOGER!)
]
```

**Achterkant:**
```typescript
DRIVERS_LICENSE_BACK_NL: [
  { x: 5%, y: 75%, width: 90%, height: 8% },   // Volledige onderkant
]
```

## 🔍 Waarom Verschillende Zones?

### ID Kaart Layout (Europees Standaard Model)
```
╔══════════════════════════════════╗
║ 🇳🇱 NEDERLAND                     ║
║ IDENTITEITSKAART      [FOTO]     ║
║                                  ║
║ 1. Naam: JANSEN                  ║
║ 2. Voornamen: JAN                ║
║ 3. Nationaliteit: Nederlandse    ║
║ 4. Geb.datum: 01.01.1990         ║
║                                  ║
║ 5. BSN: 123456789    ← 75% van   ║ ← ID zones
║ Doc: NLABCD12345     ← boven     ║
╚══════════════════════════════════╝
```

### Rijbewijs Layout (EU Model)
```
╔══════════════════════════════════╗
║ 🇳🇱 NEDERLAND    RIJBEWIJS        ║
║                        [FOTO]    ║
║ 1. JANSEN                        ║
║ 2. JAN                           ║
║ 3. 01.01.1990, Nederland         ║
║ 4a. 15.06.2020                   ║
║ 4b. 15.06.2030                   ║
║ 4c. Municipality                 ║
║ 5. 123456789       ← 70% van     ║ ← Rijbewijs zones
║ 9. B                ← boven      ║
╚══════════════════════════════════╝
```

**Verschil:** 
- ID: BSN op 75% (onderaan)
- Rijbewijs: BSN op 70% (iets hoger, bij punt 5)

## 🤔 Wat Als Je Het Verkeerd Instelt?

### Scenario 1: ID Upload maar als Rijbewijs ingesteld

```typescript
// FOUT: Dit is een ID maar je zegt rijbewijs
<IdPhotoUpload 
  documentType="DRIVERS_LICENSE"  // ← FOUT!
  side="FRONT"
/>
```

**Gevolg:**
- Systeem gebruikt rijbewijs zones (70% hoogte)
- ID heeft BSN op 75% hoogte
- BSN wordt mogelijk **niet volledig** afgeschermd! ⚠️

### Scenario 2: Voorkant Upload maar als Achterkant ingesteld

```typescript
// FOUT: Dit is voorkant maar je zegt achterkant
<IdPhotoUpload 
  documentType="ID"
  side="BACK"  // ← FOUT!
/>
```

**Gevolg:**
- Systeem gebruikt ID achterkant zones (3 zones, incl. bovenkant)
- Voorkant heeft andere layout
- Te veel of verkeerde zones ⚠️

## ✅ Best Practice: Duidelijke Labels

Gebruik altijd duidelijke labels zodat gebruiker goed uploadt:

```typescript
<IdPhotoUpload 
  label="ID KAART VOORKANT"  // ← Duidelijk!
  documentType="ID"
  side="FRONT"
/>

<IdPhotoUpload 
  label="RIJBEWIJS VOORKANT"  // ← Duidelijk!
  documentType="DRIVERS_LICENSE"
  side="FRONT"
/>
```

## 🚀 Toekomstige Verbetering: AI Detectie

**Nu:**
```
Jij zegt → "Dit is een ID voorkant"
         ↓
Systeem → "Ok, ik gebruik ID voorkant zones"
```

**Toekomst (met AI/ML):**
```
Upload foto → AI analyseert
            ↓
AI detecteert → "Dit is een Nederlands ID, voorkant"
              ↓
Systeem → "Ok, ik gebruik automatisch de juiste zones"
```

Mogelijk met:
- OCR (Optical Character Recognition)
- Document classificatie AI
- Layout detectie
- Automatische rotatie correctie

## 🎓 Samenvatting

**Vraag:** Hoe weet het systeem waar BSN staat?

**Antwoord:** Via 3 dingen:

1. **Jij vertelt het** via `documentType` en `side` parameters
2. **Voorgedefinieerde zones** per documenttype in `BSN_REDACTION_ZONES`
3. **Automatische selectie** via `getBsnRedactionZones()` functie

**Belangrijk:**
- ✅ ID kaart heeft andere zones dan rijbewijs
- ✅ Voorkant heeft andere zones dan achterkant
- ✅ Gebruik correcte parameters voor juiste beveiliging
- ✅ Duidelijke labels helpen gebruiker goed te uploaden

**Code locatie:**
- Zones: `lib/image-security.ts` → `BSN_REDACTION_ZONES`
- Selectie: `lib/image-security.ts` → `getBsnRedactionZones()`
- Gebruik: `app/dashboard/new/page.tsx` → component props

