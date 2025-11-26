/**
 * Image Security Utilities
 * 
 * This module provides utilities to add watermarks and redact sensitive information
 * from uploaded ID and driver's license photos for security and compliance.
 */

import { intelligentBsnRedaction, getRecommendedZones } from './ocr-bsn-detection'

interface WatermarkOptions {
  text?: string
  opacity?: number
  fontSize?: number
  color?: string
  angle?: number
}

/**
 * Add a diagonal watermark to an image
 * This helps prevent misuse of ID photos stored in the system
 */
export async function addWatermarkToImage(
  base64Image: string,
  options: WatermarkOptions = {}
): Promise<string> {
  const {
    text = "AUTOOFY - ALLEEN VERIFICATIE",
    opacity = 0.3,
    fontSize = 40,
    color = "#B22234",
    angle = -45,
  } = options

  return new Promise((resolve, reject) => {
    try {
      // Create an image element
      const img = new Image()
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Prepare watermark
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.fillStyle = color
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Rotate canvas for diagonal watermark
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((angle * Math.PI) / 180)

        // Draw multiple watermarks for better coverage
        const spacing = 200
        const rows = Math.ceil(canvas.height / spacing) + 2
        const cols = Math.ceil(canvas.width / spacing) + 2

        for (let row = -rows; row < rows; row++) {
          for (let col = -cols; col < cols; col++) {
            ctx.fillText(text, col * spacing, row * spacing)
          }
        }

        ctx.restore()

        // Add border indicator (subtle red border)
        ctx.strokeStyle = color
        ctx.lineWidth = 8
        ctx.globalAlpha = 0.6
        ctx.strokeRect(0, 0, canvas.width, canvas.height)

        // Add small timestamp in corner
        ctx.globalAlpha = 0.5
        ctx.fillStyle = color
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "right"
        ctx.fillText(
          `Gearchiveerd: ${new Date().toLocaleDateString("nl-NL")}`,
          canvas.width - 10,
          canvas.height - 10
        )

        // Convert canvas to base64
        const watermarkedImage = canvas.toDataURL("image/jpeg", 0.9)
        resolve(watermarkedImage)
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      // Load the image
      img.src = base64Image
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Add redaction boxes to hide sensitive information
 * Useful for hiding BSN numbers, photos, or other sensitive data
 * ENHANCED: Adds debug logging and visual confirmation
 */
export async function addRedactionBoxes(
  base64Image: string,
  boxes: Array<{ x: number; y: number; width: number; height: number }>
): Promise<string> {
  console.log(`🔒 Adding ${boxes.length} redaction boxes...`)
  boxes.forEach((box, i) => {
    console.log(`   Box ${i + 1}: x=${box.x}%, y=${box.y}%, w=${box.width}%, h=${box.height}%`)
  })
  
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        if (!ctx) {
          console.error("❌ Could not get canvas context!")
          reject(new Error("Could not get canvas context"))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        console.log(`📐 Canvas size: ${canvas.width}x${canvas.height}`)

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Draw redaction boxes (black rectangles) - SOLID BLACK!
        ctx.fillStyle = "#000000"
        ctx.globalAlpha = 1.0  // FULLY OPAQUE!
        
        boxes.forEach((box, i) => {
          // Convert percentages to pixels
          const x = (box.x / 100) * canvas.width
          const y = (box.y / 100) * canvas.height
          const width = (box.width / 100) * canvas.width
          const height = (box.height / 100) * canvas.height
          
          console.log(`   Drawing box ${i + 1}: (${Math.round(x)}, ${Math.round(y)}) ${Math.round(width)}x${Math.round(height)}px`)
          
          // Draw the black rectangle
          ctx.fillRect(x, y, width, height)
          
          // Add white text label for debugging (optional - comment out for production)
          ctx.fillStyle = "#FFFFFF"
          ctx.font = "bold 16px Arial"
          ctx.fillText(`BSN AFGESCHERMD`, x + 10, y + height / 2)
          ctx.fillStyle = "#000000"  // Reset to black
        })

        console.log("✅ All redaction boxes drawn!")
        const redactedImage = canvas.toDataURL("image/jpeg", 0.95)
        resolve(redactedImage)
      }

      img.onerror = () => {
        console.error("❌ Failed to load image for redaction!")
        reject(new Error("Failed to load image"))
      }

      img.src = base64Image
    } catch (error) {
      console.error("❌ Redaction error:", error)
      reject(error)
    }
  })
}

/**
 * BSN redaction zones for different document types
 * ULTRA AGGRESSIVE: Covers entire bottom portion to guarantee BSN is blocked!
 * Coordinates are in percentages (x, y, width, height)
 */
export const BSN_REDACTION_ZONES = {
  // Nederlandse ID kaart voorkant
  // EXTREEM BREED - vanaf helft van foto!
  ID_FRONT_NL: [
    { x: 0, y: 50, width: 100, height: 40 },  // Onderste 40%! (50-90%)
  ],
  
  // Nederlandse ID kaart achterkant
  // Dekken zowel boven als onder - zeer breed
  ID_BACK_NL: [
    { x: 0, y: 5, width: 100, height: 25 },   // Bovenkant (5-30%)
    { x: 0, y: 50, width: 100, height: 40 },  // Onderkant (50-90%)
  ],
  
  // Nederlands rijbewijs voorkant
  // EXTRA EXTRA BREED - BSN staat altijd onderaan
  DRIVERS_LICENSE_FRONT_NL: [
    { x: 0, y: 45, width: 100, height: 45 },  // Onderste 45%!! (45-90%)
  ],
  
  // Nederlands rijbewijs achterkant
  // Dekken volledige onderkant - zeer breed
  DRIVERS_LICENSE_BACK_NL: [
    { x: 0, y: 50, width: 100, height: 40 },  // Onderste 40% (50-90%)
  ],
}

/**
 * Get appropriate redaction zones based on document type and side
 */
export function getBsnRedactionZones(
  documentType: 'ID' | 'DRIVERS_LICENSE',
  side: 'FRONT' | 'BACK'
): Array<{ x: number; y: number; width: number; height: number }> {
  const key = `${documentType}_${side}_NL` as keyof typeof BSN_REDACTION_ZONES
  return BSN_REDACTION_ZONES[key] || []
}

/**
 * Process ID photo with security measures
 * Applies watermark and optionally redacts sensitive areas (BSN)
 * SIMPLIFIED: Always uses broad zones for maximum safety!
 */
export async function processIdPhoto(
  base64Image: string,
  options: {
    addWatermark?: boolean
    redactBsn?: boolean
    useIntelligentDetection?: boolean
    documentType?: 'ID' | 'DRIVERS_LICENSE'
    side?: 'FRONT' | 'BACK'
    customRedactionBoxes?: Array<{ x: number; y: number; width: number; height: number }>
  } = {}
): Promise<string> {
  console.log("🎯 processIdPhoto called with options:", { 
    redactBsn: options.redactBsn, 
    documentType: options.documentType, 
    side: options.side 
  })
  
  const { 
    addWatermark = true, 
    redactBsn = true,
    useIntelligentDetection = false,  // DISABLED for now - too complex
    documentType = 'ID',
    side = 'FRONT',
    customRedactionBoxes = []
  } = options
  
  let processedImage = base64Image

  // STEP 1: BSN REDACTIE (zwarte balken) - ALTIJD EERST!
  if (redactBsn) {
    console.log("🔒 BSN Redactie ACTIEF - Grote zwarte balk wordt geplaatst...")
    
    // Gebruik ALTIJD simpele, brede zones - geen complexe detectie
    const redactionBoxes = getBsnRedactionZones(documentType, side)
    console.log(`📦 Using ${redactionBoxes.length} predefined zones`)
    
    // Voeg custom zones toe indien opgegeven
    if (customRedactionBoxes.length > 0) {
      redactionBoxes.push(...customRedactionBoxes)
    }

    // PAS REDACTIE TOE
    if (redactionBoxes.length > 0) {
      console.log("🎨 Applying redaction boxes NOW...")
      processedImage = await addRedactionBoxes(processedImage, redactionBoxes)
      console.log("✅ Redaction applied successfully!")
    } else {
      console.warn("⚠️ No redaction boxes defined!")
    }
  } else {
    console.log("⏭️ BSN redactie uitgeschakeld")
  }

  // STEP 2: WATERMERK - DAARNA!
  if (addWatermark) {
    console.log("🔄 Adding watermark...")
    processedImage = await addWatermarkToImage(processedImage)
    console.log("✅ Watermark added!")
  }

  console.log("🎉 Photo processing complete!")
  return processedImage
}

/**
 * Compress image to reduce storage size while maintaining quality
 */
export async function compressImage(
  base64Image: string,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw image with new dimensions
        ctx.drawImage(img, 0, 0, width, height)

        const compressedImage = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedImage)
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.src = base64Image
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get estimated size of base64 image in MB
 */
export function getBase64ImageSize(base64Image: string): number {
  // Remove data URL prefix if present
  const base64Data = base64Image.split(",")[1] || base64Image
  
  // Calculate size (base64 is ~33% larger than original)
  const sizeInBytes = (base64Data.length * 3) / 4
  const sizeInMB = sizeInBytes / (1024 * 1024)
  
  return parseFloat(sizeInMB.toFixed(2))
}

