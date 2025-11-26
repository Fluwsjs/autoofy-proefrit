/**
 * Hybrid Redaction: OCR + Fallback Zones
 * 
 * This module provides a hybrid approach:
 * 1. Try OCR detection first (intelligent)
 * 2. If OCR fails, use fallback zones (guaranteed coverage)
 * 
 * This ensures critical information like BSN and license numbers
 * are ALWAYS redacted, even if OCR fails.
 */

import type { RedactionMatch, BoundingBox, DocumentType, DocumentSide } from './types'

/**
 * Fallback zones for critical information
 * These are used when OCR fails to detect information
 * Coordinates are in percentages
 */
export const FALLBACK_ZONES: Record<string, Array<{ x: number; y: number; width: number; height: number; label: string }>> = {
  // Dutch Driving License Front
  'DRIVERS_LICENSE_FRONT': [
    // Punt 5 (BSN + License Number) - CRITICAL!
    { x: 0, y: 65, width: 50, height: 12, label: 'BSN + License Number (punt 5)' },
    // Punt 3 (Date of Birth)
    { x: 0, y: 48, width: 50, height: 8, label: 'Date of Birth (punt 3)' },
    // MRZ Bottom line
    { x: 0, y: 88, width: 100, height: 12, label: 'MRZ' },
  ],
  
  // Dutch Driving License Back
  'DRIVERS_LICENSE_BACK': [
    // Bottom section (any additional info)
    { x: 0, y: 75, width: 100, height: 15, label: 'Bottom section' },
    // MRZ if present
    { x: 0, y: 88, width: 100, height: 12, label: 'MRZ' },
  ],
  
  // Dutch ID Front
  'ID_FRONT': [
    // BSN area (punt 5)
    { x: 0, y: 70, width: 50, height: 12, label: 'BSN (punt 5)' },
    // Date of birth area
    { x: 0, y: 55, width: 50, height: 8, label: 'Date of Birth' },
  ],
  
  // Dutch ID Back
  'ID_BACK': [
    // Top section
    { x: 0, y: 10, width: 100, height: 20, label: 'Top section' },
    // Bottom section
    { x: 0, y: 70, width: 100, height: 15, label: 'Bottom section' },
    // MRZ
    { x: 0, y: 88, width: 100, height: 12, label: 'MRZ' },
  ],
}

/**
 * Get fallback zones for a document type and side
 */
export function getFallbackZones(
  documentType: DocumentType,
  side: DocumentSide
): Array<{ x: number; y: number; width: number; height: number; label: string }> {
  const key = `${documentType}_${side}`
  return FALLBACK_ZONES[key] || []
}

/**
 * Convert percentage-based zones to pixel-based zones
 */
export function convertZonesToPixels(
  zones: Array<{ x: number; y: number; width: number; height: number; label: string }>,
  imageWidth: number,
  imageHeight: number
): Array<{ bbox: BoundingBox; label: string }> {
  return zones.map(zone => ({
    bbox: {
      x: (zone.x / 100) * imageWidth,
      y: (zone.y / 100) * imageHeight,
      width: (zone.width / 100) * imageWidth,
      height: (zone.height / 100) * imageHeight,
    },
    label: zone.label,
  }))
}

/**
 * Add fallback redaction zones to OCR matches
 * 
 * This ensures critical areas are ALWAYS redacted, even if OCR fails
 */
export function addFallbackZones(
  ocrMatches: RedactionMatch[],
  documentType: DocumentType,
  side: DocumentSide,
  imageWidth: number,
  imageHeight: number,
  aggressive: boolean = true
): RedactionMatch[] {
  console.log(`🛡️ Adding fallback zones for ${documentType} ${side}...`)
  
  const fallbackZones = getFallbackZones(documentType, side)
  
  if (fallbackZones.length === 0) {
    console.log('ℹ️ No fallback zones defined for this document type')
    return ocrMatches
  }
  
  const pixelZones = convertZonesToPixels(fallbackZones, imageWidth, imageHeight)
  
  // Determine which zones to add
  const zonesToAdd: RedactionMatch[] = []
  
  for (const zone of pixelZones) {
    // Check if this area is already covered by OCR matches
    const alreadyCovered = ocrMatches.some(match => 
      boxesOverlap(match.bbox, zone.bbox, 0.3) // 30% overlap threshold
    )
    
    if (!alreadyCovered) {
      console.log(`⚠️ Adding fallback zone: ${zone.label} (OCR missed this area)`)
      
      zonesToAdd.push({
        type: 'DOCUMENT_NUMBER', // Generic type for fallback
        text: `[Fallback: ${zone.label}]`,
        bbox: zone.bbox,
        confidence: 1.0, // High confidence - we know this area needs redaction
        reason: `Fallback zone: ${zone.label} (OCR detection failed)`,
      })
    } else {
      console.log(`✅ Zone already covered by OCR: ${zone.label}`)
    }
  }
  
  // In aggressive mode, ALWAYS add critical zones (BSN, License Number)
  if (aggressive && documentType === 'DRIVERS_LICENSE' && side === 'FRONT') {
    console.log('🔥 AGGRESSIVE MODE: Adding punt 5 zone regardless of OCR')
    const punt5Zone = pixelZones.find(z => z.label.includes('punt 5'))
    if (punt5Zone) {
      // Remove any existing punt 5 fallback to avoid duplicates
      const filtered = zonesToAdd.filter(z => !z.reason?.includes('punt 5'))
      
      filtered.push({
        type: 'LICENSE_NUMBER',
        text: '[Fallback: Punt 5 - CRITICAL]',
        bbox: punt5Zone.bbox,
        confidence: 1.0,
        reason: 'CRITICAL: Punt 5 area (BSN + License Number) - Aggressive fallback',
      })
      
      return [...ocrMatches, ...filtered]
    }
  }
  
  console.log(`🛡️ Added ${zonesToAdd.length} fallback zone(s)`)
  return [...ocrMatches, ...zonesToAdd]
}

/**
 * Check if two bounding boxes overlap
 * 
 * @param box1 First box
 * @param box2 Second box
 * @param threshold Minimum overlap ratio (0-1)
 * @returns true if boxes overlap by at least threshold amount
 */
function boxesOverlap(box1: BoundingBox, box2: BoundingBox, threshold: number = 0.3): boolean {
  // Calculate intersection
  const x1 = Math.max(box1.x, box2.x)
  const y1 = Math.max(box1.y, box2.y)
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width)
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height)
  
  if (x2 < x1 || y2 < y1) {
    return false // No intersection
  }
  
  const intersectionArea = (x2 - x1) * (y2 - y1)
  const box1Area = box1.width * box1.height
  const box2Area = box2.width * box2.height
  const minArea = Math.min(box1Area, box2Area)
  
  const overlapRatio = intersectionArea / minArea
  
  return overlapRatio >= threshold
}

/**
 * Get image dimensions from base64
 */
export function getImageDimensions(imageBase64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageBase64
  })
}

