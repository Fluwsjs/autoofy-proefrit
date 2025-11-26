/**
 * OCR-based Document Redaction using Tesseract.js
 * 
 * This is the main redaction pipeline that:
 * 1. Runs OCR on uploaded document images
 * 2. Detects sensitive information (BSN, dates, MRZ, etc.)
 * 3. Draws black rectangles over sensitive areas
 * 4. Returns the redacted image
 */

import { createWorker, type Worker } from 'tesseract.js'
import type { 
  RedactionOptions, 
  RedactionResult, 
  RedactionMatch,
  BoundingBox 
} from './types'
import { detectBSNInOCR } from './bsn'
import { detectDatesInOCR, detectMRZInOCR, detectDocumentNumbersInOCR } from './patterns'
import { addFallbackZones, getImageDimensions } from './hybridRedaction'

/**
 * Main OCR-based redaction function
 * 
 * @param imageBase64 - Base64 encoded image
 * @param options - Redaction options
 * @returns Redaction result with redacted image
 */
export async function redactDocumentWithOCR(
  imageBase64: string,
  options: RedactionOptions = {}
): Promise<RedactionResult> {
  const startTime = performance.now()
  const errors: string[] = []
  
  console.log('🔍 Starting OCR-based redaction...')
  
  try {
    // Default options
    const opts: Required<Pick<RedactionOptions, 'redactBSN' | 'redactDateOfBirth' | 'redactMRZ' | 'redactDocumentNumber' | 'ocrLanguages' | 'ocrConfidenceThreshold' | 'redactionColor' | 'debug'>> = {
      redactBSN: options.redactBSN ?? true,
      redactDateOfBirth: options.redactDateOfBirth ?? true,
      redactMRZ: options.redactMRZ ?? true,
      redactDocumentNumber: options.redactDocumentNumber ?? false,
      ocrLanguages: options.ocrLanguages ?? ['nld', 'eng'],
      ocrConfidenceThreshold: options.ocrConfidenceThreshold ?? 60,
      redactionColor: options.redactionColor ?? '#000000',
      debug: options.debug ?? true,
    }
    
    // Step 1: Initialize Tesseract worker
    console.log('📚 Initializing Tesseract worker...')
    const worker = await createWorker(opts.ocrLanguages, 1, {
      logger: opts.debug ? (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      } : undefined,
    })
    
    // Step 2: Run OCR
    console.log('🔎 Running OCR...')
    const { data } = await worker.recognize(imageBase64)
    
    // Type assertion for Tesseract data
    const dataAny = data as any
    
    if (opts.debug) {
      console.log(`📄 OCR Text (${data.text.length} chars):`, data.text.substring(0, 200) + '...')
      console.log(`📊 Confidence: ${data.confidence}%`)
      console.log(`📝 Words detected: ${dataAny.words?.length || 0}`)
    }
    
    // Step 3: Detect sensitive information
    const matches: RedactionMatch[] = []
    
    // Convert Tesseract format to our format
    const words = (dataAny.words || []).map((w: any) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: {
        x: w.bbox.x0,
        y: w.bbox.y0,
        width: w.bbox.x1 - w.bbox.x0,
        height: w.bbox.y1 - w.bbox.y0,
      },
    })).filter((w: any) => w.confidence >= opts.ocrConfidenceThreshold)
    
    const lines = (dataAny.lines || []).map((l: any) => ({
      text: l.text,
      bbox: {
        x: l.bbox.x0,
        y: l.bbox.y0,
        width: l.bbox.x1 - l.bbox.x0,
        height: l.bbox.y1 - l.bbox.y0,
      },
    }))
    
    // Detect BSN
    if (opts.redactBSN) {
      console.log('🔍 Detecting BSN numbers...')
      const bsnMatches = detectBSNInOCR(data.text, words)
      matches.push(...bsnMatches)
      console.log(`✅ Found ${bsnMatches.length} BSN match(es)`)
    }
    
    // Detect dates of birth
    if (opts.redactDateOfBirth) {
      console.log('📅 Detecting dates of birth...')
      const dateMatches = detectDatesInOCR(data.text, words)
      matches.push(...dateMatches)
      console.log(`✅ Found ${dateMatches.length} date match(es)`)
    }
    
    // Detect MRZ
    if (opts.redactMRZ) {
      console.log('🔤 Detecting MRZ...')
      const mrzMatches = detectMRZInOCR(data.text, lines)
      matches.push(...mrzMatches)
      console.log(`✅ Found ${mrzMatches.length} MRZ match(es)`)
    }
    
    // Detect document numbers
    if (opts.redactDocumentNumber) {
      console.log('🔢 Detecting document numbers...')
      const docMatches = detectDocumentNumbersInOCR(data.text, words)
      matches.push(...docMatches)
      console.log(`✅ Found ${docMatches.length} document number match(es)`)
    }
    
    // Clean up worker
    await worker.terminate()
    
    // Step 3.5: Add fallback zones for missed areas (HYBRID APPROACH)
    console.log('🛡️ Checking for missed areas...')
    const imageDimensions = await getImageDimensions(imageBase64)
    const allMatches = addFallbackZones(
      matches,
      options.documentType || 'ID',
      options.side || 'FRONT',
      imageDimensions.width,
      imageDimensions.height,
      true // Aggressive mode: ALWAYS add critical zones
    )
    
    console.log(`📦 Total redaction zones: ${allMatches.length} (${matches.length} OCR + ${allMatches.length - matches.length} fallback)`)
    
    // Step 4: Draw redactions on canvas
    console.log(`🎨 Drawing ${allMatches.length} redaction box(es)...`)
    const redactedImage = await drawRedactionsOnImage(
      imageBase64,
      allMatches,
      opts.redactionColor
    )
    
    const processingTime = performance.now() - startTime
    console.log(`✅ Redaction complete in ${Math.round(processingTime)}ms`)
    
    return {
      success: true,
      redactedImageBase64: redactedImage,
      matches: allMatches, // Return all matches including fallbacks
      errors: errors.length > 0 ? errors : undefined,
      processingTimeMs: processingTime,
    }
    
  } catch (error) {
    const processingTime = performance.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ OCR redaction error:', errorMessage)
    errors.push(errorMessage)
    
    return {
      success: false,
      matches: [],
      errors,
      processingTimeMs: processingTime,
    }
  }
}

/**
 * Draw black rectangles over sensitive areas on the image
 */
async function drawRedactionsOnImage(
  imageBase64: string,
  matches: RedactionMatch[],
  color: string = '#000000'
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Draw redaction boxes
        ctx.fillStyle = color
        ctx.globalAlpha = 1.0  // Fully opaque
        
        for (const match of matches) {
          const { bbox } = match
          
          // Draw solid black rectangle
          ctx.fillRect(
            bbox.x,
            bbox.y,
            bbox.width,
            bbox.height
          )
          
          // Optional: Add label for debugging
          if (process.env.NODE_ENV === 'development') {
            ctx.fillStyle = '#FFFFFF'
            ctx.font = '12px Arial'
            ctx.fillText(
              match.type,
              bbox.x + 5,
              bbox.y + bbox.height / 2
            )
            ctx.fillStyle = color
          }
        }
        
        // Export as base64
        const redactedBase64 = canvas.toDataURL('image/jpeg', 0.92)
        resolve(redactedBase64)
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = imageBase64
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Quick validation check before OCR
 * Checks if image is suitable for OCR processing
 */
export function validateImageForOCR(imageBase64: string): {
  valid: boolean
  error?: string
} {
  // Check if it's a valid base64 image
  if (!imageBase64.startsWith('data:image/')) {
    return {
      valid: false,
      error: 'Invalid image format (not a base64 data URL)',
    }
  }
  
  // Check size (base64 size estimate)
  const base64Data = imageBase64.split(',')[1]
  const sizeInBytes = (base64Data.length * 3) / 4
  const sizeInMB = sizeInBytes / (1024 * 1024)
  
  if (sizeInMB > 10) {
    return {
      valid: false,
      error: `Image too large (${sizeInMB.toFixed(1)}MB, max 10MB)`,
    }
  }
  
  return { valid: true }
}

