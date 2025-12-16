import jsPDF from "jspdf"

interface CompanyInfo {
  companyName?: string | null
  companyAddress?: string | null
  companyZipCode?: string | null
  companyCity?: string | null
  companyPhone?: string | null
  companyKvK?: string | null
  companyVAT?: string | null
  companyLogo?: string | null
}

interface TestrideData {
  customerName: string
  customerEmail: string
  customerPhone: string | null
  address: string
  startTime: string
  endTime: string
  date: string
  carType: string
  licensePlate: string | null
  driverLicenseNumber: string | null
  idCountryOfOrigin: string | null
  dealerPlate: {
    plate: string
  } | null
  dealerPlateCardGiven?: boolean
  idPhotoFrontUrl: string | null
  idPhotoBackUrl: string | null
  customerSignatureUrl: string | null
  sellerSignatureUrl: string | null
  completionSignatureUrl: string | null
  eigenRisico: number
  aantalSleutels: number
  status: string
  completedAt: string | null
  startKm: number
  endKm: number | null
  notes: string | null
  createdAt: string
  companyInfo?: CompanyInfo
  sellerName?: string | null
  vehicleSold?: boolean
  damagePhotoUrls?: string[]
}

// Color palette - Autoofy branding
const COLORS = {
  primary: { r: 29, g: 53, b: 87 },      // #1D3557 - Dark blue
  accent: { r: 178, g: 34, b: 52 },       // #B22234 - Red
  success: { r: 34, g: 139, b: 34 },      // Green
  lightBg: { r: 248, g: 250, b: 252 },    // Light gray background
  border: { r: 226, g: 232, b: 240 },     // Border gray
  text: { r: 30, g: 41, b: 59 },          // Dark text
  textMuted: { r: 100, g: 116, b: 139 },  // Muted text
  white: { r: 255, g: 255, b: 255 },
}

export async function exportTestrideToPDF(testride: TestrideData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number): boolean => {
    if (yPosition + requiredHeight > pageHeight - margin - 20) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper: Set color from palette
  const setColor = (color: { r: number; g: number; b: number }, type: 'fill' | 'text' | 'draw' = 'text') => {
    if (type === 'fill') {
      doc.setFillColor(color.r, color.g, color.b)
    } else if (type === 'draw') {
      doc.setDrawColor(color.r, color.g, color.b)
    } else {
      doc.setTextColor(color.r, color.g, color.b)
    }
  }

  // Helper: Draw a rounded rectangle
  const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, style: 'F' | 'S' | 'FD' = 'F') => {
    doc.roundedRect(x, y, width, height, radius, radius, style)
  }

  // Helper: Draw section card with header
  const drawSectionCard = (title: string, startY: number, contentHeight: number, headerColor = COLORS.primary): number => {
    const headerHeight = 10
    const totalHeight = headerHeight + contentHeight + 4
    
    // Card background
    setColor(COLORS.white, 'fill')
    setColor(COLORS.border, 'draw')
    doc.setLineWidth(0.5)
    drawRoundedRect(margin, startY, contentWidth, totalHeight, 3, 'FD')
    
    // Header
    setColor(headerColor, 'fill')
    doc.rect(margin, startY, contentWidth, headerHeight, 'F')
    // Round top corners manually
    doc.setFillColor(headerColor.r, headerColor.g, headerColor.b)
    drawRoundedRect(margin, startY, contentWidth, headerHeight + 2, 3, 'F')
    doc.rect(margin, startY + 3, contentWidth, headerHeight - 1, 'F')
    
    // Header text
    setColor(COLORS.white)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(title, margin + 6, startY + 7)
    
    return startY + headerHeight + 2
  }

  // Helper: Add label-value pair
  const addLabelValue = (label: string, value: string, x: number, y: number, maxWidth: number = 80): number => {
    setColor(COLORS.textMuted)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(label, x, y)
    
    setColor(COLORS.text)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    const lines = doc.splitTextToSize(value, maxWidth)
    doc.text(lines, x, y + 4)
    
    return 4 + (lines.length * 4) + 3
  }

  // Helper: Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  // Helper: Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Helper: Add company logo
  const addCompanyLogo = async (): Promise<void> => {
    if (!testride.companyInfo?.companyLogo) return
    
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            const maxHeight = 20
            const maxWidth = 50
            let imgWidth = img.width
            let imgHeight = img.height
            
            // Scale to fit
            if (imgHeight > maxHeight) {
              imgWidth = (imgWidth / imgHeight) * maxHeight
              imgHeight = maxHeight
            }
            if (imgWidth > maxWidth) {
              imgHeight = (imgHeight / imgWidth) * maxWidth
              imgWidth = maxWidth
            }
            
            const logoX = pageWidth - margin - imgWidth
            const logoY = 12
            
            doc.addImage(testride.companyInfo!.companyLogo!, "PNG", logoX, logoY, imgWidth, imgHeight)
            resolve()
          } catch {
            resolve()
          }
        }
        img.onerror = () => resolve()
        img.src = testride.companyInfo!.companyLogo!
      })
    } catch {
      // Silently fail if logo can't be loaded
    }
  }

  // Helper: Add Autoofy logo
  const addAutoofyLogo = async (): Promise<void> => {
    if (typeof window === 'undefined') return
    
    try {
      const logoUrl = `${window.location.origin}/autoofy-logo.svg`
      const response = await fetch(logoUrl)
      if (!response.ok) return
      
      const svgText = await response.text()
      const img = new Image()
      img.crossOrigin = "anonymous"
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              URL.revokeObjectURL(url)
              resolve()
              return
            }
            
            canvas.width = img.width || 152
            canvas.height = img.height || 17
            ctx.drawImage(img, 0, 0)
            
            const dataUrl = canvas.toDataURL('image/png')
            const logoWidth = 40
            const logoHeight = (canvas.height / canvas.width) * logoWidth
            
            // Place in header if no company logo, otherwise skip
            if (!testride.companyInfo?.companyLogo) {
              doc.addImage(dataUrl, "PNG", pageWidth - margin - logoWidth, 14, logoWidth, logoHeight)
            }
            
            URL.revokeObjectURL(url)
            resolve()
          } catch {
            URL.revokeObjectURL(url)
            resolve()
          }
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          resolve()
        }
        img.src = url
      })
    } catch {
      // Silently fail
    }
  }

  // ============================================
  // HEADER
  // ============================================
  
  // Header background with gradient effect
  setColor(COLORS.primary, 'fill')
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Subtle accent stripe
  setColor(COLORS.accent, 'fill')
  doc.rect(0, 43, pageWidth, 2, 'F')
  
  // Add logos
  await addCompanyLogo()
  await addAutoofyLogo()
  
  // Title
  setColor(COLORS.white)
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.text("PROEFRIT FORMULIER", margin, 25)
  
  // Subtitle with date
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`${formatDate(testride.date)} - ${testride.carType}`, margin, 33)
  
  // Status badge
  const statusText = testride.status === "COMPLETED" ? "AFGEROND" : "ACTIEF"
  const statusColor = testride.status === "COMPLETED" ? COLORS.success : COLORS.accent
  const statusWidth = doc.getTextWidth(statusText) + 12
  
  setColor(statusColor, 'fill')
  drawRoundedRect(margin, 36, statusWidth, 6, 2, 'F')
  setColor(COLORS.white)
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text(statusText, margin + 6, 40)

  yPosition = 55

  // ============================================
  // COMPANY INFO (if available)
  // ============================================
  if (testride.companyInfo?.companyName) {
    setColor(COLORS.textMuted)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    
    let companyText = testride.companyInfo.companyName
    if (testride.companyInfo.companyAddress) {
      companyText += ` - ${testride.companyInfo.companyAddress}`
    }
    if (testride.companyInfo.companyZipCode && testride.companyInfo.companyCity) {
      companyText += `, ${testride.companyInfo.companyZipCode} ${testride.companyInfo.companyCity}`
    }
    if (testride.companyInfo.companyPhone) {
      companyText += ` - Tel: ${testride.companyInfo.companyPhone}`
    }
    
    doc.text(companyText, margin, yPosition)
    yPosition += 8
  }

  // ============================================
  // KLANT & VOERTUIG INFO (Two columns)
  // ============================================
  
  const colWidth = (contentWidth - 6) / 2
  const leftCol = margin
  const rightCol = margin + colWidth + 6
  
  // Card background
  checkPageBreak(70)
  setColor(COLORS.lightBg, 'fill')
  setColor(COLORS.border, 'draw')
  doc.setLineWidth(0.3)
  drawRoundedRect(margin, yPosition, contentWidth, 65, 4, 'FD')
  
  // Left column - Klantgegevens
  let leftY = yPosition + 8
  setColor(COLORS.primary)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("KLANTGEGEVENS", leftCol + 4, leftY)
  leftY += 8
  
  leftY += addLabelValue("Naam", testride.customerName, leftCol + 4, leftY, colWidth - 8)
  leftY += addLabelValue("E-mail", testride.customerEmail, leftCol + 4, leftY, colWidth - 8)
  if (testride.customerPhone) {
    leftY += addLabelValue("Telefoon", testride.customerPhone, leftCol + 4, leftY, colWidth - 8)
  }
  leftY += addLabelValue("Adres", testride.address, leftCol + 4, leftY, colWidth - 8)
  
  // Divider line
  setColor(COLORS.border, 'draw')
  doc.setLineWidth(0.5)
  doc.line(margin + colWidth + 3, yPosition + 4, margin + colWidth + 3, yPosition + 61)
  
  // Right column - Voertuiggegevens
  let rightY = yPosition + 8
  setColor(COLORS.primary)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("VOERTUIGGEGEVENS", rightCol + 4, rightY)
  rightY += 8
  
  rightY += addLabelValue("Type / Model", testride.carType, rightCol + 4, rightY, colWidth - 8)
  if (testride.licensePlate) {
    rightY += addLabelValue("Kenteken / Chassisnr.", testride.licensePlate, rightCol + 4, rightY, colWidth - 8)
  }
  if (testride.dealerPlate) {
    rightY += addLabelValue("Handelaarskenteken", testride.dealerPlate.plate, rightCol + 4, rightY, colWidth - 8)
  }
  if (testride.driverLicenseNumber) {
    rightY += addLabelValue("Rijbewijs / BSN", testride.driverLicenseNumber, rightCol + 4, rightY, colWidth - 8)
  }
  if (testride.idCountryOfOrigin) {
    rightY += addLabelValue("Land van herkomst ID", testride.idCountryOfOrigin, rightCol + 4, rightY, colWidth - 8)
  }
  
  yPosition = Math.max(leftY, rightY) + 12

  // ============================================
  // RITGEGEVENS
  // ============================================
  checkPageBreak(45)
  
  // Section header
  setColor(COLORS.primary, 'fill')
  drawRoundedRect(margin, yPosition, contentWidth, 8, 3, 'F')
  setColor(COLORS.white)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("RITGEGEVENS", margin + 6, yPosition + 5.5)
  yPosition += 12
  
  // Content in boxes
  const boxWidth = (contentWidth - 8) / 4
  const boxHeight = 22
  const boxes = [
    { label: "Datum", value: formatDate(testride.date) },
    { label: "Starttijd", value: formatTime(testride.startTime) },
    { label: "Eindtijd", value: formatTime(testride.endTime) },
    { label: "Verkoper", value: testride.sellerName || "-" },
  ]
  
  boxes.forEach((box, i) => {
    const boxX = margin + (i * (boxWidth + 2.5))
    setColor(COLORS.white, 'fill')
    setColor(COLORS.border, 'draw')
    doc.setLineWidth(0.3)
    drawRoundedRect(boxX, yPosition, boxWidth, boxHeight, 2, 'FD')
    
    setColor(COLORS.textMuted)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text(box.label, boxX + boxWidth/2, yPosition + 6, { align: 'center' })
    
    setColor(COLORS.text)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(box.value, boxX + boxWidth/2, yPosition + 15, { align: 'center' })
  })
  
  yPosition += boxHeight + 6

  // ============================================
  // KILOMETERSTAND
  // ============================================
  checkPageBreak(35)
  
  setColor(COLORS.primary, 'fill')
  drawRoundedRect(margin, yPosition, contentWidth, 8, 3, 'F')
  setColor(COLORS.white)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("KILOMETERSTAND", margin + 6, yPosition + 5.5)
  yPosition += 12
  
  const kmBoxWidth = (contentWidth - 6) / 3
  const kmBoxes = [
    { label: "Start KM", value: `${testride.startKm.toLocaleString('nl-NL')} km`, color: COLORS.textMuted },
    { label: "Eind KM", value: testride.endKm !== null ? `${testride.endKm.toLocaleString('nl-NL')} km` : "-", color: COLORS.textMuted },
    { label: "Gereden", value: testride.endKm !== null ? `${(testride.endKm - testride.startKm).toLocaleString('nl-NL')} km` : "-", color: COLORS.primary },
  ]
  
  kmBoxes.forEach((box, i) => {
    const boxX = margin + (i * (kmBoxWidth + 3))
    const isHighlight = i === 2
    
    if (isHighlight) {
      setColor(COLORS.primary, 'fill')
    } else {
      setColor(COLORS.white, 'fill')
    }
    setColor(COLORS.border, 'draw')
    doc.setLineWidth(0.3)
    drawRoundedRect(boxX, yPosition, kmBoxWidth, boxHeight, 2, 'FD')
    
    if (isHighlight) {
      setColor(COLORS.white)
    } else {
      setColor(COLORS.textMuted)
    }
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text(box.label, boxX + kmBoxWidth/2, yPosition + 6, { align: 'center' })
    
    if (isHighlight) {
      setColor(COLORS.white)
    } else {
      setColor(COLORS.text)
    }
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text(box.value, boxX + kmBoxWidth/2, yPosition + 15, { align: 'center' })
  })
  
  yPosition += boxHeight + 8

  // ============================================
  // AANVULLENDE INFO
  // ============================================
  checkPageBreak(30)
  
  setColor(COLORS.lightBg, 'fill')
  setColor(COLORS.border, 'draw')
  doc.setLineWidth(0.3)
  drawRoundedRect(margin, yPosition, contentWidth, 24, 3, 'FD')
  
  const infoY = yPosition + 6
  const infoItems = [
    { label: "Eigen risico", value: `EUR ${testride.eigenRisico}` },
    { label: "Sleutels", value: `${testride.aantalSleutels}x` },
  ]
  
  if (testride.dealerPlate && testride.dealerPlateCardGiven !== undefined) {
    infoItems.push({ label: "Kentekenpas mee", value: testride.dealerPlateCardGiven ? "Ja" : "Nee" })
  }
  
  if (testride.vehicleSold) {
    infoItems.push({ label: "Voertuig verkocht", value: "Ja" })
  }
  
  const itemWidth = contentWidth / infoItems.length
  infoItems.forEach((item, i) => {
    const itemX = margin + (i * itemWidth) + 6
    
    setColor(COLORS.textMuted)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text(item.label, itemX, infoY)
    
    setColor(COLORS.text)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(item.value, itemX, infoY + 10)
  })
  
  yPosition += 30

  // ============================================
  // NOTITIES
  // ============================================
  if (testride.notes) {
    checkPageBreak(35)
    
    setColor(COLORS.primary, 'fill')
    drawRoundedRect(margin, yPosition, contentWidth, 8, 3, 'F')
    setColor(COLORS.white)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("NOTITIES", margin + 6, yPosition + 5.5)
    yPosition += 12
    
    setColor(COLORS.text)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    const noteLines = doc.splitTextToSize(testride.notes, contentWidth - 8)
    doc.text(noteLines, margin + 4, yPosition)
    yPosition += (noteLines.length * 4) + 8
  }

  // ============================================
  // AFBEELDINGEN (ID, Handtekeningen, Schade)
  // ============================================
  
  const addImageSection = async (imageUrl: string, label: string, maxWidth: number = 70): Promise<void> => {
    checkPageBreak(60)
    
    // Section label
    setColor(COLORS.textMuted)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPosition)
    yPosition += 5
    
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            const imgWidth = Math.min(maxWidth, contentWidth - 20)
            const imgHeight = (img.height / img.width) * imgWidth
            
            // Border around image
            setColor(COLORS.border, 'draw')
            doc.setLineWidth(0.5)
            doc.rect(margin, yPosition, imgWidth + 4, imgHeight + 4, 'S')
            
            doc.addImage(imageUrl, "PNG", margin + 2, yPosition + 2, imgWidth, imgHeight)
            yPosition += imgHeight + 10
            resolve()
          } catch {
            yPosition += 5
            resolve()
          }
        }
        img.onerror = () => {
          setColor(COLORS.textMuted)
          doc.setFontSize(8)
          doc.setFont("helvetica", "italic")
          doc.text("Afbeelding kon niet worden geladen", margin, yPosition)
          yPosition += 8
          resolve()
        }
        img.src = imageUrl
      })
    } catch {
      yPosition += 5
    }
  }

  // ID Photos
  if (testride.idPhotoFrontUrl || testride.idPhotoBackUrl) {
    checkPageBreak(20)
    setColor(COLORS.primary, 'fill')
    drawRoundedRect(margin, yPosition, contentWidth, 8, 3, 'F')
    setColor(COLORS.white)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("IDENTIFICATIE", margin + 6, yPosition + 5.5)
    yPosition += 14
    
    if (testride.idPhotoFrontUrl) {
      await addImageSection(testride.idPhotoFrontUrl, "ID/Rijbewijs voorkant", 80)
    }
    if (testride.idPhotoBackUrl) {
      await addImageSection(testride.idPhotoBackUrl, "ID/Rijbewijs achterkant", 80)
    }
  }

  // Damage Photos
  if (testride.damagePhotoUrls && testride.damagePhotoUrls.length > 0) {
    checkPageBreak(20)
    setColor(COLORS.accent, 'fill')
    drawRoundedRect(margin, yPosition, contentWidth, 8, 3, 'F')
    setColor(COLORS.white)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("SCHADE FOTO'S", margin + 6, yPosition + 5.5)
    yPosition += 14
    
    for (let i = 0; i < testride.damagePhotoUrls.length; i++) {
      await addImageSection(testride.damagePhotoUrls[i], `Schade foto ${i + 1}`, 80)
    }
  }

  // Signatures
  if (testride.customerSignatureUrl || testride.sellerSignatureUrl || testride.completionSignatureUrl) {
    checkPageBreak(20)
    setColor(COLORS.primary, 'fill')
    drawRoundedRect(margin, yPosition, contentWidth, 8, 3, 'F')
    setColor(COLORS.white)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("HANDTEKENINGEN", margin + 6, yPosition + 5.5)
    yPosition += 14
    
    if (testride.customerSignatureUrl) {
      await addImageSection(testride.customerSignatureUrl, "Klant handtekening", 90)
    }
    if (testride.sellerSignatureUrl) {
      await addImageSection(testride.sellerSignatureUrl, "Verkoper handtekening", 90)
    }
    if (testride.completionSignatureUrl) {
      await addImageSection(testride.completionSignatureUrl, "Handtekening bij afronding", 90)
    }
  }

  // ============================================
  // VOORWAARDEN (altijd op nieuwe pagina)
  // ============================================
  doc.addPage()
  yPosition = margin
  
  // Header for terms page
  setColor(COLORS.primary, 'fill')
  doc.rect(0, 0, pageWidth, 25, 'F')
  setColor(COLORS.accent, 'fill')
  doc.rect(0, 23, pageWidth, 2, 'F')
  
  setColor(COLORS.white)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("VOORWAARDEN PROEFRITPROCEDURE", margin, 16)
  
  yPosition = 35

  // Terms content in two columns
  const termsColWidth = (contentWidth - 8) / 2
  const leftTermsX = margin
  const rightTermsX = margin + termsColWidth + 8
  
  let termsLeftY = yPosition
  let termsRightY = yPosition

  // Helper for terms sections
  const addTermsSection = (title: string, content: string[], x: number, y: number, width: number): number => {
    setColor(COLORS.primary)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(title, x, y)
    y += 5
    
    setColor(COLORS.text)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    
    content.forEach(line => {
      const wrappedLines = doc.splitTextToSize(line, width)
      doc.text(wrappedLines, x, y)
      y += wrappedLines.length * 3.5 + 2
    })
    
    return y + 3
  }

  // Left column terms
  termsLeftY = addTermsSection("Proefrit", [
    "- De klant ontvangt het voertuig in bruikleen voor een bepaalde periode.",
    "- Het voertuig blijft eigendom van het autobedrijf.",
    "- De klant moet het voertuig op de afgesproken datum en tijd inleveren.",
    "- Verlenging is alleen mogelijk met schriftelijke toestemming.",
    "- Bij te laat inleveren kunnen kosten in rekening worden gebracht.",
    "- Bij gebruik van handelaarskenteken mag het voertuig alleen worden getest.",
  ], leftTermsX, termsLeftY, termsColWidth)

  termsLeftY = addTermsSection("Kentekendocumenten", [
    "De klant moet alle kentekendocumenten die bij aanvang van de proefrit zijn verstrekt, aan het einde van de proefrit aan het autobedrijf inleveren.",
  ], leftTermsX, termsLeftY, termsColWidth)

  termsLeftY = addTermsSection("Vrijwaring", [
    "De klant ontheft het bedrijf van alle schades voortvloeiend uit of ontstaan tijdens het gebruik van het voertuig, waaronder boetes, overtredingen, inbeslagneming en vorderingen van derden.",
  ], leftTermsX, termsLeftY, termsColWidth)

  // Right column terms
  termsRightY = addTermsSection("Verzekering", [
    "- De klant is aansprakelijk voor schades die niet gedekt worden door de verzekering.",
    "- Schade aan het voertuig moet direct worden gemeld.",
    "- Bij alleen WA-verzekering is de klant volledig aansprakelijk voor schade aan of verlies van het voertuig indien geen derde aansprakelijk is.",
  ], rightTermsX, termsRightY, termsColWidth)

  termsRightY = addTermsSection("Persoonsgegevens", [
    "De persoonsgegevens worden verwerkt conform de AVG. Op basis hiervan kan het autobedrijf de overeenkomst uitvoeren, optimale service bieden en gepersonaliseerde aanbiedingen doen.",
    "Persoonsgegevens kunnen worden verstrekt aan derden voor direct marketing activiteiten.",
    "Bezwaren betreffende verwerking voor direct mailing worden gehonoreerd.",
  ], rightTermsX, termsRightY, termsColWidth)

  // ============================================
  // FOOTER ON ALL PAGES
  // ============================================
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Footer line
    setColor(COLORS.border, 'draw')
    doc.setLineWidth(0.3)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
    
    // Footer text
    setColor(COLORS.textMuted)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    
    doc.text(`Aangemaakt: ${formatDate(testride.createdAt)} ${formatTime(testride.createdAt)}`, margin, pageHeight - 10)
    
    if (testride.status === "COMPLETED" && testride.completedAt) {
      doc.text(`Afgerond: ${formatDate(testride.completedAt)} ${formatTime(testride.completedAt)}`, margin + 60, pageHeight - 10)
    }
    
    doc.text(`Pagina ${i} van ${pageCount}`, pageWidth - margin - 25, pageHeight - 10)
    
    // Powered by Autoofy
    doc.setFontSize(6)
    doc.text("Powered by Autoofy", pageWidth - margin, pageHeight - 5, { align: 'right' })
  }

  // ============================================
  // SAVE PDF
  // ============================================
  const dateStr = formatDate(testride.date).replace(/\//g, "-")
  const customerNameStr = testride.customerName.replace(/[^a-zA-Z0-9]/g, "_")
  const filename = `Proefrit_${customerNameStr}_${dateStr}.pdf`

  doc.save(filename)
}
