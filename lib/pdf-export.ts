import jsPDF from "jspdf"

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
  dealerPlate: {
    plate: string
  } | null
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
}

export async function exportTestrideToPDF(testride: TestrideData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return lines.length * (fontSize * 0.4) // Approximate line height
  }

  // Helper function to add logo to PDF
  const addLogoToPDF = async (): Promise<void> => {
    // Only run if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn("PDF logo can only be added in browser environment")
      return
    }

    try {
      // Load SVG and convert to canvas for PDF
      const logoUrl = `${window.location.origin}/autoofy-logo.svg`
      
      const response = await fetch(logoUrl)
      if (!response.ok) {
        console.warn("Could not load logo for PDF")
        return
      }
      
      const svgText = await response.text()
      
      // Create an image from the SVG
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      // Convert SVG to data URL
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            // Create canvas to convert SVG to PNG
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              URL.revokeObjectURL(url)
              resolve()
              return
            }
            
            // Set canvas size based on image
            canvas.width = img.width || 152
            canvas.height = img.height || 17
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0)
            
            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/png')
            
            // Add logo to header (right side)
            const logoWidth = 45
            const logoHeight = (canvas.height / canvas.width) * logoWidth
            const logoX = pageWidth - margin - logoWidth
            const logoY = 8
            
            doc.addImage(dataUrl, "PNG", logoX, logoY, logoWidth, logoHeight)
            
            URL.revokeObjectURL(url)
            resolve()
          } catch (error) {
            console.error("Error adding logo to PDF:", error)
            URL.revokeObjectURL(url)
            resolve()
          }
        }
        img.onerror = () => {
          console.warn("Could not load logo image for PDF")
          URL.revokeObjectURL(url)
          resolve()
        }
        img.src = url
      })
    } catch (error) {
      console.error("Error loading logo for PDF:", error)
    }
  }

  // Header
  doc.setFillColor(29, 53, 87) // Autoofy dark blue #1D3557
  doc.rect(0, 0, pageWidth, 40, "F")
  
  // Add logo to header
  await addLogoToPDF()
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "normal")
  doc.text("Proefrit Formulier", margin, 35)

  yPosition = 50

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Klantgegevens
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Klantgegevens", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  yPosition += addText(`Naam: ${testride.customerName}`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 5
  yPosition += addText(`E-mail: ${testride.customerEmail}`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 5
  if (testride.customerPhone) {
    yPosition += addText(`Telefoon: ${testride.customerPhone}`, margin, yPosition, pageWidth - 2 * margin)
    yPosition += 5
  }
  yPosition += addText(`Adres: ${testride.address}`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 10

  checkPageBreak(30)

  // Autogegevens
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Autogegevens", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  yPosition += addText(`Type: ${testride.carType}`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 5
  if (testride.licensePlate) {
    yPosition += addText(`Kenteken voertuig, meldcode of chassisnummer: ${testride.licensePlate}`, margin, yPosition, pageWidth - 2 * margin)
    yPosition += 5
  }
  if (testride.dealerPlate) {
    yPosition += addText(`Handelaarskenteken: ${testride.dealerPlate.plate}`, margin, yPosition, pageWidth - 2 * margin)
    yPosition += 5
  }
    if (testride.driverLicenseNumber) {
      yPosition += addText(`Rijbewijs of BSN nummer: ${testride.driverLicenseNumber}`, margin, yPosition, pageWidth - 2 * margin)
      yPosition += 5
    }
  yPosition += 10

  checkPageBreak(30)

  // Ritgegevens
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Ritgegevens", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  yPosition += addText(`Datum: ${formatDate(testride.date)}`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 5
  yPosition += addText(`Starttijd: ${formatTime(testride.startTime)}`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 5
  yPosition += addText(`Eindtijd: ${formatTime(testride.endTime)}`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 10

  checkPageBreak(30)

  // Kilometerstand
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Kilometerstand", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  yPosition += addText(`Start: ${testride.startKm} km`, margin, yPosition, pageWidth - 2 * margin)
  yPosition += 5
  if (testride.endKm !== null) {
    yPosition += addText(`Eind: ${testride.endKm} km`, margin, yPosition, pageWidth - 2 * margin)
    yPosition += 5
    yPosition += addText(`Afstand: ${testride.endKm - testride.startKm} km`, margin, yPosition, pageWidth - 2 * margin)
    yPosition += 5
  }
  yPosition += 10

  // Eigen risico en aantal sleutels
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Aanvullende informatie", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Eigen risico: €${testride.eigenRisico}`, margin, yPosition)
  yPosition += 7
  doc.text(`Aantal sleutels meegegeven: ${testride.aantalSleutels}`, margin, yPosition)
  yPosition += 10

  // Notities
  if (testride.notes) {
    checkPageBreak(30)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Notities", margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    yPosition += addText(testride.notes, margin, yPosition, pageWidth - 2 * margin)
    yPosition += 10
  }

  // Helper function to add image to PDF
  const addImageToPDF = async (imageUrl: string, label: string, maxWidth: number = 80): Promise<number> => {
    checkPageBreak(60)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPosition)
    yPosition += 10

    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const imgWidth = maxWidth
            const imgHeight = (img.height / img.width) * imgWidth
            doc.addImage(imageUrl, "PNG", margin, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 10
            resolve(null)
          } catch (error) {
            console.error(`Error adding ${label} to PDF:`, error)
            yPosition += 10
            resolve(null)
          }
        }
        img.onerror = reject
        img.src = imageUrl
      })
      return yPosition
    } catch (error) {
      console.error(`Error loading ${label}:`, error)
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`${label} kon niet worden geladen`, margin, yPosition)
      yPosition += 10
      return yPosition
    }
  }

  // Rijbewijs of ID Foto's
  if (testride.idPhotoFrontUrl || testride.idPhotoBackUrl) {
    if (testride.idPhotoFrontUrl) {
      await addImageToPDF(testride.idPhotoFrontUrl, "Rijbewijs of ID foto voorkant", 80)
    }
    if (testride.idPhotoBackUrl) {
      await addImageToPDF(testride.idPhotoBackUrl, "Rijbewijs of ID foto achterkant", 80)
    }
  }

  // Handtekeningen
  if (testride.customerSignatureUrl || testride.sellerSignatureUrl || testride.completionSignatureUrl) {
    if (testride.customerSignatureUrl) {
      await addImageToPDF(testride.customerSignatureUrl, "Klant handtekening", 100)
    }
    if (testride.sellerSignatureUrl) {
      await addImageToPDF(testride.sellerSignatureUrl, "Verkoper handtekening/stempel", 100)
    }
    if (testride.completionSignatureUrl) {
      await addImageToPDF(testride.completionSignatureUrl, "Handtekening bij afronding", 100)
    }
  }

  // Status
  if (testride.status === "COMPLETED" && testride.completedAt) {
    checkPageBreak(20)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Status", margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    yPosition += addText(`Afgerond op: ${formatDate(testride.completedAt)} ${formatTime(testride.completedAt)}`, margin, yPosition, pageWidth - 2 * margin)
    yPosition += 10
  }

  // Voorwaarden proefritprocedure
  checkPageBreak(150)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 128, 0) // Green color
  doc.text("Voorwaarden proefritprocedure", margin, yPosition)
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0) // Black color
  
  // Left column content
  const leftMargin = margin
  const rightMargin = pageWidth / 2 + 5
  const columnWidth = (pageWidth - 2 * margin - 10) / 2
  let leftY = yPosition

  // Proefrit section (left column)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 128, 0) // Green
  doc.text("Proefrit", leftMargin, leftY)
  leftY += 7

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0) // Black
  leftY += addText("• De klant ontvangt het voertuig in bruikleen voor een bepaalde periode.", leftMargin, leftY, columnWidth, 9)
  leftY += 4
  leftY += addText("• Het voertuig blijft eigendom van het autobedrijf.", leftMargin, leftY, columnWidth, 9)
  leftY += 4
  leftY += addText("• De klant moet het voertuig op de datum en tijd zoals vermeld op de voorkant inleveren.", leftMargin, leftY, columnWidth, 9)
  leftY += 4
  leftY += addText("• Het is niet toegestaan deze periode te verlengen zonder schriftelijke toestemming van het autobedrijf.", leftMargin, leftY, columnWidth, 9)
  leftY += 4
  leftY += addText("• Voor elk uur dat het voertuig te laat wordt ingeleverd, kan het autobedrijf kosten in rekening brengen.", leftMargin, leftY, columnWidth, 9)
  leftY += 4
  leftY += addText("• Bij rijden met een handelaarskenteken moet de klant zich wegens wettelijke bepalingen beperken tot het testen van het voertuig.", leftMargin, leftY, columnWidth, 9)
  leftY += 4
  leftY += addText("• Dit betekent dat het verboden is het voertuig te parkeren op de openbare weg of te gebruiken voor het vervoeren van personen en/of goederen (bijv. boodschappen doen).", leftMargin, leftY, columnWidth, 9)
  leftY += 7

  // Kentekendocumenten (left column)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 128, 0) // Green
  doc.text("Kentekendocumenten", leftMargin, leftY)
  leftY += 7

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0) // Black
  leftY += addText("De klant moet alle kentekendocumenten die bij aanvang van de proefrit zijn verstrekt, aan het einde van de proefrit aan het autobedrijf inleveren.", leftMargin, leftY, columnWidth, 9)
  leftY += 7

  // Vrijwaring (left column)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 128, 0) // Green
  doc.text("Vrijwaring", leftMargin, leftY)
  leftY += 7

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0) // Black
  leftY += addText("De klant ontheft het bedrijf van alle schades voortvloeiend uit of ontstaan tijdens het gebruik van het voertuig, waaronder maar niet beperkt tot boetes, overtredingen en/of inbeslagneming en/of verbeurdverklaring van het voertuig, alsmede voor vorderingen van derden in verband met het gebruik van het voertuig.", leftMargin, leftY, columnWidth, 9)

  // Right column content
  let rightY = yPosition

  // Verzekering (right column)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 128, 0) // Green
  doc.text("Verzekering", rightMargin, rightY)
  rightY += 7

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0) // Black
  rightY += addText("• De klant is aansprakelijk voor alle schades voortvloeiend uit of ontstaan tijdens het gebruik van het voertuig, voor zover deze niet gedekt worden door de op de voorkant vermelde verzekering.", rightMargin, rightY, columnWidth, 9)
  rightY += 4
  rightY += addText("• Schade aan het voertuig ontstaan tijdens gebruik dient direct te worden gemeld aan het autobedrijf.", rightMargin, rightY, columnWidth, 9)
  rightY += 4
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  rightY += addText("N.B.: Indien het voertuig uitsluitend WA (aansprakelijkheidsverzekering) verzekerd is, is de klant jegens het autobedrijf volledig aansprakelijk voor schade aan of verlies van het voertuig en/of inzittenden indien geen derde daarvoor aansprakelijk is.", rightMargin, rightY, columnWidth, 9)
  rightY += 7

  // Persoonsgegevens (right column)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 128, 0) // Green
  doc.text("Persoonsgegevens", rightMargin, rightY)
  rightY += 7

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0) // Black
  rightY += addText("De persoonsgegevens van de klant zoals genoemd op het proefritformulier worden door het autobedrijf verwerkt, mogelijk in de zin van de Algemene Verordening Gegevensbescherming (AVG).", rightMargin, rightY, columnWidth, 9)
  rightY += 4
  rightY += addText("Op basis van deze verwerking kan het autobedrijf de overeenkomst uitvoeren, de klant optimale service bieden, hen tijdig voorzien van actuele auto-informatie en gepersonaliseerde aanbiedingen doen.", rightMargin, rightY, columnWidth, 9)
  rightY += 4
  rightY += addText("Daarnaast kunnen persoonsgegevens worden verstrekt aan derden, waaronder de importeur van een automerk, voor direct marketing activiteiten voor voertuigen.", rightMargin, rightY, columnWidth, 9)
  rightY += 4
  rightY += addText("Elk bezwaar van de klant jegens het autobedrijf betreffende de verwerking van persoonsgegevens in de zin van de Algemene Verordening Gegevensbescherming (AVG) voor direct mailing activiteiten wordt gehonoreerd.", rightMargin, rightY, columnWidth, 9)

  // Set yPosition to the maximum of both columns
  yPosition = Math.max(leftY, rightY) + 10

  // Footer
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(128, 128, 128)
  doc.text(
    `Aangemaakt op: ${formatDate(testride.createdAt)} ${formatTime(testride.createdAt)}`,
    margin,
    footerY
  )

  // Generate filename
  const dateStr = formatDate(testride.date).replace(/\//g, "-")
  const customerNameStr = testride.customerName.replace(/[^a-zA-Z0-9]/g, "_")
  const filename = `Proefrit_${customerNameStr}_${dateStr}.pdf`

  // Save PDF
  doc.save(filename)
}

