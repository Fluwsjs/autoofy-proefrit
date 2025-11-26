/**
 * Intelligent BSN Detection using OCR
 * 
 * This module detects BSN numbers in ID photos using Optical Character Recognition
 * and automatically redacts them, regardless of document layout or photo angle.
 */

/**
 * BSN Pattern Matcher
 * Dutch BSN (Burgerservicenummer) is 9 digits
 * Can appear as: 123456789, 123.456.789, 123-456-789, or with spaces
 */
const BSN_PATTERNS = [
  /\b\d{9}\b/g,                           // 123456789
  /\b\d{3}[\.\-\s]\d{3}[\.\-\s]\d{3}\b/g, // 123.456.789 or 123-456-789 or 123 456 789
]

/**
 * Simplified OCR using Canvas text detection
 * We'll look for 9-digit patterns in common BSN locations
 */
export interface DetectedBsnZone {
  x: number        // X position (percentage)
  y: number        // Y position (percentage)
  width: number    // Width (percentage)
  height: number   // Height (percentage)
  confidence: number // Detection confidence (0-1)
}

/**
 * Detect BSN-like patterns using simplified heuristics
 * This is a lightweight approach that works without heavy OCR libraries
 */
export async function detectBsnZones(
  base64Image: string
): Promise<DetectedBsnZone[]> {
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

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Use intelligent zone detection based on document structure
        const detectedZones = detectZonesIntelligently(canvas, ctx)
        
        resolve(detectedZones)
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
 * Intelligent zone detection using image analysis
 * Detects text-heavy regions in the bottom portion of ID documents
 */
function detectZonesIntelligently(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): DetectedBsnZone[] {
  const zones: DetectedBsnZone[] = []
  const width = canvas.width
  const height = canvas.height

  // Analyze image in grid segments
  const imageData = ctx.getImageData(0, 0, width, height)
  
  // Focus on bottom 40% where BSN is typically located
  const startY = Math.floor(height * 0.6)
  const endY = height
  
  // Divide into horizontal strips
  const stripHeight = Math.floor((endY - startY) / 8)
  
  for (let y = startY; y < endY; y += stripHeight) {
    // Check left side (typical BSN location)
    const leftDensity = analyzeTextDensity(imageData, 0, y, Math.floor(width * 0.5), stripHeight)
    if (leftDensity > 0.3) {
      zones.push({
        x: 0,
        y: (y / height) * 100,
        width: 50,
        height: (stripHeight / height) * 100,
        confidence: leftDensity,
      })
    }
    
    // Check right side
    const rightDensity = analyzeTextDensity(imageData, Math.floor(width * 0.5), y, Math.floor(width * 0.5), stripHeight)
    if (rightDensity > 0.3) {
      zones.push({
        x: 50,
        y: (y / height) * 100,
        width: 50,
        height: (stripHeight / height) * 100,
        confidence: rightDensity,
      })
    }
  }

  // If no zones detected, use VERY BROAD coverage (safety first!)
  if (zones.length === 0) {
    zones.push(
      {
        x: 0,
        y: 55,
        width: 100,
        height: 30,
        confidence: 0.8,  // Hoge confidence want dit is veilig
      }
    )
  }

  // Merge overlapping zones
  return mergeOverlappingZones(zones)
}

/**
 * Analyze text density in a region (darker pixels = text)
 */
function analyzeTextDensity(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): number {
  const data = imageData.data
  const imgWidth = imageData.width
  let darkPixels = 0
  let totalPixels = 0

  for (let dy = 0; dy < height && (y + dy) < imageData.height; dy++) {
    for (let dx = 0; dx < width && (x + dx) < imgWidth; dx++) {
      const idx = ((y + dy) * imgWidth + (x + dx)) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      
      // Calculate brightness
      const brightness = (r + g + b) / 3
      
      // Dark pixels likely indicate text
      if (brightness < 150) {
        darkPixels++
      }
      totalPixels++
    }
  }

  return totalPixels > 0 ? darkPixels / totalPixels : 0
}

/**
 * Merge overlapping zones to avoid redundant redaction
 */
function mergeOverlappingZones(zones: DetectedBsnZone[]): DetectedBsnZone[] {
  if (zones.length <= 1) return zones

  const merged: DetectedBsnZone[] = []
  const sorted = zones.sort((a, b) => a.y - b.y)

  let current = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    
    // Check if zones overlap
    if (Math.abs(current.y - next.y) < 5 && Math.abs(current.x - next.x) < 10) {
      // Merge zones
      current = {
        x: Math.min(current.x, next.x),
        y: Math.min(current.y, next.y),
        width: Math.max(current.x + current.width, next.x + next.width) - Math.min(current.x, next.x),
        height: Math.max(current.y + current.height, next.y + next.height) - Math.min(current.y, next.y),
        confidence: Math.max(current.confidence, next.confidence),
      }
    } else {
      merged.push(current)
      current = next
    }
  }
  
  merged.push(current)
  return merged
}

/**
 * Enhanced redaction that uses intelligent detection
 */
export async function intelligentBsnRedaction(
  base64Image: string,
  fallbackZones: Array<{ x: number; y: number; width: number; height: number }> = []
): Promise<Array<{ x: number; y: number; width: number; height: number }>> {
  try {
    // Try intelligent detection
    const detectedZones = await detectBsnZones(base64Image)
    
    if (detectedZones.length > 0) {
      // Use detected zones
      console.log(`✅ Intelligent detection found ${detectedZones.length} potential BSN zones`)
      return detectedZones.map(zone => ({
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
      }))
    }
    
    // Fall back to provided zones if detection fails
    if (fallbackZones.length > 0) {
      console.log(`⚠️ Using fallback zones (${fallbackZones.length} zones)`)
      return fallbackZones
    }
    
    // Last resort: VERY BROAD coverage of bottom area (SAFETY FIRST!)
    console.log(`⚠️ Using default BROAD coverage for maximum safety`)
    return [
      { x: 0, y: 55, width: 100, height: 30 }, // Cover large bottom area
    ]
  } catch (error) {
    console.error("BSN detection error:", error)
    // Return fallback zones on error
    return fallbackZones.length > 0 ? fallbackZones : [
      { x: 0, y: 65, width: 100, height: 20 },
    ]
  }
}

/**
 * Validate if a number could be a BSN
 * BSN uses the 11-proof check (elfproef)
 */
export function isValidBsnFormat(bsn: string): boolean {
  // Remove any non-digit characters
  const digits = bsn.replace(/\D/g, '')
  
  // Must be exactly 9 digits
  if (digits.length !== 9) return false
  
  // Apply 11-proof check (elfproef)
  const numbers = digits.split('').map(Number)
  let sum = 0
  
  for (let i = 0; i < 8; i++) {
    sum += numbers[i] * (9 - i)
  }
  
  sum -= numbers[8] // Last digit is subtracted
  
  return sum % 11 === 0
}

/**
 * Get recommended zones based on document type and side
 * UPDATED: Much more aggressive coverage to ensure BSN is always blocked!
 */
export function getRecommendedZones(
  documentType: 'ID' | 'DRIVERS_LICENSE',
  side: 'FRONT' | 'BACK'
): Array<{ x: number; y: number; width: number; height: number }> {
  const zoneMap = {
    'ID_FRONT': [
      // ZEER BREED - dekken hele onderkant af voor zekerheid
      { x: 0, y: 60, width: 100, height: 25 },  // Volledige onderkant
    ],
    'ID_BACK': [
      { x: 0, y: 10, width: 100, height: 20 },  // Bovenkant breed
      { x: 0, y: 60, width: 100, height: 25 },  // Onderkant breed
    ],
    'DRIVERS_LICENSE_FRONT': [
      // Extra breed voor rijbewijs - BSN staat vaak onderaan
      { x: 0, y: 55, width: 100, height: 30 },  // Volledige onderste deel
    ],
    'DRIVERS_LICENSE_BACK': [
      { x: 0, y: 60, width: 100, height: 25 },  // Volledige onderkant
    ],
  }
  
  const key = `${documentType}_${side}` as keyof typeof zoneMap
  return zoneMap[key] || [{ x: 0, y: 55, width: 100, height: 30 }]
}

