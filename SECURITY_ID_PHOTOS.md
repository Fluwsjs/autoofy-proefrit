# Beveiliging van ID Foto's en Rijbewijzen

## Overzicht

Om klantgegevens te beschermen tegen misbruik, worden alle geuploade ID foto's en rijbewijzen automatisch beveiligd met de volgende maatregelen:

## Beveiligingsmaatregelen

### 1. Automatisch Watermerk ✅

Elke geuploade foto krijgt automatisch een watermerk met:
- **Tekst**: "AUTOOFY - ALLEEN VERIFICATIE"
- **Meerdere watermerks**: Over de hele foto verspreid
- **Diagonaal geplaatst**: Lastig te verwijderen
- **Semi-transparant**: Foto blijft leesbaar maar is duidelijk gemarkeerd
- **Rode rand**: Visuele indicator dat dit een beveiligde foto is
- **Timestamp**: Archiveringsdatum in de hoek

### 2. Automatische Compressie

- Foto's worden automatisch geoptimaliseerd naar maximaal 1920px breedte
- Kwaliteit wordt behouden (85%)
- Bij te grote bestanden wordt agressievere compressie toegepast (1280px, 75%)
- Dit bespaart opslagruimte en laadtijd

### 3. Bestandsgrootte Limiet

- Upload limiet: 10MB (voor verwerking)
- Finale limiet: 5MB (na compressie en watermerk)
- Automatische optimalisatie als te groot

## Hoe het werkt

### Bij Upload (Client-side Beveiliging)

1. **Gebruiker selecteert foto**
   - Bestandstype check (alleen afbeeldingen)
   - Grootte check (max 10MB)

2. **Automatische verwerking**
   - Foto wordt gelezen als base64
   - Compressie wordt toegepast
   - Watermerk wordt toegevoegd
   - Finale grootte check

3. **Opslag in database**
   - Beveiligde foto wordt opgeslagen als base64 string
   - Originele foto wordt NIET bewaard
   - Alleen de gewatermerkte versie bestaat

### Componenten

#### `lib/image-security.ts`
Bevat alle beveiligingsfuncties:

- `addWatermarkToImage()` - Voegt watermerk toe
- `addRedactionBoxes()` - Zwart maken van delen (optioneel)
- `processIdPhoto()` - Hoofdfunctie voor verwerking
- `compressImage()` - Optimalisatie
- `getBase64ImageSize()` - Grootte berekening

#### `components/IdPhotoUpload.tsx`
Upload component met automatische beveiliging:

- Toont "Beveiligd met watermerk" indicator
- Processing feedback tijdens verwerking
- Bevestiging na succesvolle beveiliging
- Preview van beveiligde foto

## Voordelen

### 🔒 Privacy & Veiligheid
- Foto's kunnen niet worden misbruikt
- Duidelijk herkenbaar als verificatie materiaal
- Geen originele foto's in systeem

### 📝 Compliance
- GDPR compliant door minimale data bewaring
- Duidelijke markering van doeleinde
- Timestamp voor audit trail

### 💾 Efficiëntie
- Kleinere bestanden door compressie
- Snellere laadtijden
- Minder opslagruimte nodig

### 👤 Gebruikerservaring
- Automatisch proces (geen extra stappen)
- Visuele feedback tijdens verwerking
- Duidelijke communicatie over beveiliging

## Technische Details

### Watermerk Specificaties

```typescript
{
  text: "AUTOOFY - ALLEEN VERIFICATIE",
  opacity: 0.3,              // 30% transparantie
  fontSize: 40,              // Duidelijk leesbaar
  color: "#B22234",          // Autoofy rood
  angle: -45,                // Diagonaal
  spacing: 200px,            // Herhaald over hele foto
}
```

### Canvas Technologie

- Gebruikt HTML5 Canvas API
- Client-side verwerking (sneller, veiliger)
- JPEG output met optimale kwaliteit
- Cross-browser compatible

### Compressie Instellingen

**Standaard:**
- Max breedte: 1920px
- Kwaliteit: 85%
- Format: JPEG

**Agressief (bij grote bestanden):**
- Max breedte: 1280px
- Kwaliteit: 75%
- Format: JPEG

## Uitbreidingsmogelijkheden

### Optionele Redactie (Zwart maken)

De functionaliteit is aanwezig maar standaard niet actief. Je kunt specifieke gebieden zwart maken:

```typescript
const processedImage = await processIdPhoto(base64Image, {
  addWatermark: true,
  redactionBoxes: [
    { x: 10, y: 20, width: 30, height: 15 }, // Percentages van totale afbeelding
  ]
})
```

### AI Detectie (Toekomstig)

Mogelijke uitbreidingen:
- Automatische detectie van BSN nummers
- Gezichtsherkenning voor blurring pasfoto
- Documententype detectie
- Kwaliteitscontrole (onscherp, te donker, etc.)

## Bestaande Foto's Beveiligen

Als je bestaande foto's in de database hebt die nog niet beveiligd zijn, kun je deze handmatig beveiligen via een script. De functionaliteit is er, maar moet nog geïmplementeerd worden als admin functie.

## Veiligheidsadviezen

### ✅ Best Practices

1. **Minimale bewaarperiode**: Verwijder foto's na gebruik
2. **Toegangscontrole**: Alleen geautoriseerde gebruikers
3. **Audit logging**: Log wie wanneer foto's bekijkt
4. **SSL/TLS**: Altijd HTTPS gebruiken
5. **Database encryptie**: Extra bescherming in rust

### ⚠️ Belangrijk

- **Originele foto's worden NIET bewaard**: Alleen gewatermerkte versie
- **Watermerk kan niet verwijderd worden**: Permanent in de foto
- **Client-side verwerking**: Gebeurt in de browser, niet op server
- **Eenmalig proces**: Upload → Beveilig → Opslaan (geen tussenversies)

## Wettelijke Overwegingen

### GDPR Compliance

- ✅ **Data minimalisatie**: Alleen noodzakelijke foto's
- ✅ **Purpose limitation**: Duidelijk doel (verificatie)
- ✅ **Storage limitation**: Beveiligde opslag met watermerk
- ✅ **Transparency**: Gebruiker weet dat watermerk wordt toegevoegd

### AVG (Nederlandse implementatie)

- Verwerkingsdoel: Identiteitsverificatie voor proefritten
- Rechtsgrond: Gerechtvaardigd belang (fraude preventie)
- Bewaartermijn: Aanbevolen maximaal 1 jaar na proefrit
- Recht op vergetelheid: Mogelijkheid tot verwijderen

## Support & Vragen

Bij vragen over:
- Implementatie: Zie code comments in `lib/image-security.ts`
- Gebruik: Zie `components/IdPhotoUpload.tsx`
- Compliance: Raadpleeg je juridisch adviseur

## Changelog

### v1.0 (November 2025)
- ✅ Automatisch watermerk systeem
- ✅ Compressie en optimalisatie
- ✅ Client-side verwerking
- ✅ Visuele feedback voor gebruiker
- ✅ Redactie functionaliteit (optioneel)

