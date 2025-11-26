# 🔥 FIX: BSN Wordt Nu WEL Afgeschermd!

## ❌ Probleem

Op de screenshot was duidelijk te zien:
- ✅ Watermerk werkte (rode diagonale lijnen zichtbaar)
- ❌ BSN nummer was NIET afgeschermd (123456789 nog zichtbaar)
- ❌ Geen zwarte balken over BSN

## ✅ Oplossing Geïmplementeerd

### 1. VEEL Agressievere Zones

**VOOR (Te klein):**
```typescript
ID_FRONT: [
  { x: 5%, y: 75%, width: 45%, height: 8% },   // Te smal
  { x: 55%, y: 75%, width: 40%, height: 8% },  // Te smal
]
```

**NU (Breed & Veilig):**
```typescript
ID_FRONT: [
  { x: 0%, y: 60%, width: 100%, height: 25% },  // VOLLEDIGE onderkant!
]

DRIVERS_LICENSE_FRONT: [
  { x: 0%, y: 55%, width: 100%, height: 30% },  // EXTRA breed voor rijbewijs!
]
```

### Visueel Verschil

**Oude zones (TE KLEIN):**
```
╔══════════════════════════╗
║                          ║
║                          ║
║                          ║
║                          ║  60%
║                          ║
║  [▓▓▓]      [▓▓▓]        ║  75% ← Te laag!
║                          ║
╚══════════════════════════╝
   BSN hier gemist! ❌
```

**Nieuwe zones (GROOT):**
```
╔══════════════════════════╗
║                          ║
║                          ║
║                          ║  55%
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║  60% ← Start hier
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║  85% ← Eindigt hier
╚══════════════════════════╝
   BSN ALTIJD geblokkeerd! ✅
```

### 2. Alle Zone Types Bijgewerkt

**ID Voorkant:**
- Van: 2 kleine zones (5-45%, 55-95% breed, alleen op 75-83%)
- Naar: 1 grote zone (0-100% breed, van 60-85%)

**Rijbewijs Voorkant:**
- Van: 2 zones (70-80%, elk 45% breed)
- Naar: 1 EXTRA grote zone (55-85%, 100% breed)

**ID Achterkant:**
- Boven: 0-100% breed, 10-30%
- Onder: 0-100% breed, 60-85%

### 3. Intelligente Detectie Ook Agressiever

```typescript
// Als geen zones gedetecteerd, gebruik BREDE fallback
if (zones.length === 0) {
  zones.push({
    x: 0,
    y: 55,
    width: 100,
    height: 30,  // HELE onderkant!
  })
}
```

### 4. Test Component Toegevoegd

`components/BsnRedactionTest.tsx` - Gebruik dit om te testen!

Toont VOOR en NA vergelijking:
- Links: Origineel (BSN zichtbaar) ❌
- Rechts: Beveiligd (BSN zwart) ✅

## 🧪 Testen

### Stap 1: Herstart Development Server

```bash
# Stop huidige server (Ctrl+C)
npm run dev
```

### Stap 2: Test de Fix

1. Ga naar je app
2. Upload DEZELFDE rijbewijs foto
3. Kijk of het hele onderste deel nu zwart is

### Stap 3: Gebruik Test Component

Voeg toe aan een test pagina:
```typescript
import { BsnRedactionTest } from '@/components/BsnRedactionTest'

export default function TestPage() {
  return <BsnRedactionTest />
}
```

## 📊 Coverage Vergelijking

### Oude Systeem

| Zone | Hoogte | Breedte | Coverage |
|------|--------|---------|----------|
| Links | 8% | 45% | 3.6% van foto |
| Rechts | 8% | 40% | 3.2% van foto |
| **Totaal** | | | **6.8%** |

### Nieuwe Systeem

| Zone | Hoogte | Breedte | Coverage |
|------|--------|---------|----------|
| Onderste deel | 25-30% | 100% | **25-30% van foto** |

**4x meer coverage!** 🎯

## ⚠️ Trade-offs

### Wat wordt er nu afgeschermd?

**Meer afgeschermd:**
- ✅ BSN nummer (altijd!)
- ✅ Document nummer
- ✅ Mogelijk andere gegevens onderaan
- ✅ Barcode (als aanwezig)

**Blijft zichtbaar:**
- ✅ Naam (bovenaan)
- ✅ Foto (linksbovenaan)
- ✅ Geboortedatum (vaak middenstuk)
- ✅ Nationaliteit
- ✅ Meeste andere gegevens

### Is dit acceptabel?

**JA!** Omdat:
1. **BSN is de gevoeligste data** - moet altijd geblokkeerd
2. **Document nummer is ook gevoelig** - goed dat ook geblokkeerd
3. **Verificatie is nog steeds mogelijk** via naam + foto + geboortedatum
4. **Veiligheid > Bruikbaarheid** in dit geval

## 🔍 Wat Als Het NOG STEEDS Niet Werkt?

### Check 1: Console Logging

Open browser DevTools (F12) en check console:
```
✅ Moet je zien:
"🔍 Using intelligent BSN detection..."
"✅ Detected X zones to redact"

❌ Als je dit NIET ziet, wordt redactie niet aangeroepen!
```

### Check 2: Volgorde

In `lib/image-security.ts` moet volgorde zijn:
1. EERST: Redactie (zwarte balken)
2. DAARNA: Watermerk

```typescript
// 1. Redactie EERST
if (redactionBoxes.length > 0) {
  processedImage = await addRedactionBoxes(processedImage, redactionBoxes)
}

// 2. Watermerk DAARNA
if (addWatermark) {
  processedImage = await addWatermarkToImage(processedImage)
}
```

### Check 3: Parameters

In `app/dashboard/new/page.tsx`:
```typescript
<IdPhotoUpload 
  redactBsn={true}  // ← MOET true zijn!
  documentType="ID"
  side="FRONT"
/>
```

### Check 4: Export/Import

Check of functies correct geëxporteerd zijn:
```typescript
// lib/image-security.ts
export async function processIdPhoto(...) { }  // ← export!

// components/IdPhotoUpload.tsx
import { processIdPhoto } from '@/lib/image-security'  // ← import!
```

## 🐛 Debugging

### Voeg Extra Logging Toe

In `components/IdPhotoUpload.tsx`, voeg toe:
```typescript
const processedImage = await processIdPhoto(base64String, {
  addWatermark: true,
  redactBsn: redactBsn,
  useIntelligentDetection: true,
  documentType: documentType,
  side: side,
})

// DEBUG: Check of processed anders is dan origineel
console.log("Original length:", base64String.length)
console.log("Processed length:", processedImage.length)
console.log("Are they different?", base64String !== processedImage)
```

## 📱 Als Alles Werkt

Je zou nu moeten zien:
```
╔══════════════════════════════════╗
║ 🇳🇱 NEDERLAND    RIJBEWIJS       ║
║                         [FOTO]   ║
║ 1. JANSEN                        ║
║    AUTOOFY - ALLEEN              ║
║ 2. Jan                           ║
║      VERIFICATIE                 ║
║ 3. 01.01.1990                    ║
║ ████████████████████████████████ ║ ← ZWART!
║ ████████████████████████████████ ║ ← ZWART!
║ ████████████████████████████████ ║ ← ZWART!
║ ████████████████████████████████ ║ ← ZWART!
╚══════════════════════════════════╝
   Gearchiveerd: 26-11-2024
```

**Het hele onderste deel moet zwart zijn!**

## ✅ Checklist

- [x] Zones veel groter gemaakt (60-85%, 100% breed)
- [x] Alle documenttypes bijgewerkt
- [x] Intelligente detectie agressiever
- [x] Test component gemaakt
- [x] Documentatie geschreven
- [ ] **JIJ: Test met je rijbewijs foto!**
- [ ] **JIJ: Verifieer dat BSN zwart is!**

## 🚀 Next Steps

1. **Stop en herstart je dev server**
2. **Upload test foto**
3. **Check of onderste 25-30% zwart is**
4. **Gebruik BsnRedactionTest component voor voor/na vergelijking**
5. **Check browser console voor logging**

Als BSN **nog steeds** zichtbaar is na deze fix, dan is er een fundamenteler probleem met de code flow en moeten we dieper debuggen!

## 💬 Feedback Geven

Na testen, laat me weten:
- ✅ "Het werkt! BSN is nu zwart"
- ❌ "Werkt nog steeds niet, BSN is nog zichtbaar"
  - Dan: Stuur screenshot browser console
  - Dan: Stuur screenshot voor/na
  - Dan: Debuggen we verder!

**Belangrijkste punt: Het hele onderste deel (ongeveer 1/4 tot 1/3) van de foto moet nu ZWART zijn!** 🔒

