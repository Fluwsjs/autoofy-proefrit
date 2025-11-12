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
  idPhotoUrl: string | null
  startKm: number
  endKm: number | null
  signatureUrl: string | null
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

  // Header
  doc.setFillColor(30, 58, 138) // Autoofy dark blue
  doc.rect(0, 0, pageWidth, 40, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("AUTOOFY", margin, 25)
  
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
    yPosition += addText(`Rijbewijs nummer: ${testride.driverLicenseNumber}`, margin, yPosition, pageWidth - 2 * margin)
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

  // ID Foto
  if (testride.idPhotoUrl) {
    checkPageBreak(60)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("ID Foto", margin, yPosition)
    yPosition += 10

    try {
      // Convert base64 to image
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const imgWidth = 80
            const imgHeight = (img.height / img.width) * imgWidth
            doc.addImage(testride.idPhotoUrl!, "PNG", margin, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 10
            resolve(null)
          } catch (error) {
            console.error("Error adding ID photo to PDF:", error)
            yPosition += 10
            resolve(null)
          }
        }
        img.onerror = reject
        img.src = testride.idPhotoUrl!
      })
    } catch (error) {
      console.error("Error loading ID photo:", error)
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text("ID foto kon niet worden geladen", margin, yPosition)
      yPosition += 10
    }
  }

  // Handtekening
  if (testride.signatureUrl) {
    checkPageBreak(50)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Handtekening", margin, yPosition)
    yPosition += 10

    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const imgWidth = 100
            const imgHeight = (img.height / img.width) * imgWidth
            doc.addImage(testride.signatureUrl!, "PNG", margin, yPosition, imgWidth, imgHeight)
            yPosition += imgHeight + 10
            resolve(null)
          } catch (error) {
            console.error("Error adding signature to PDF:", error)
            yPosition += 10
            resolve(null)
          }
        }
        img.onerror = reject
        img.src = testride.signatureUrl!
      })
    } catch (error) {
      console.error("Error loading signature:", error)
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text("Handtekening kon niet worden geladen", margin, yPosition)
      yPosition += 10
    }
  }

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

