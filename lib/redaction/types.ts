/**
 * TypeScript types for the document redaction system
 */

/**
 * Bounding box coordinates (in pixels or percentages)
 */
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * OCR word/line result from Tesseract
 */
export interface OCRWord {
  text: string
  confidence: number
  bbox: BoundingBox
  baseline: {
    x0: number
    y0: number
    x1: number
    y1: number
    has_baseline: boolean
  }
}

/**
 * OCR line result
 */
export interface OCRLine {
  text: string
  confidence: number
  bbox: BoundingBox
  words: OCRWord[]
}

/**
 * Match found during pattern detection
 */
export interface RedactionMatch {
  type: 'BSN' | 'DATE_OF_BIRTH' | 'MRZ' | 'LICENSE_NUMBER' | 'FACE' | 'DOCUMENT_NUMBER'
  text: string
  bbox: BoundingBox
  confidence: number
  reason?: string // Why this was matched
}

/**
 * Alias for LICENSE_NUMBER (for clarity)
 */
export type DocumentNumberType = 'LICENSE_NUMBER' | 'DOCUMENT_NUMBER'

/**
 * Redaction result
 */
export interface RedactionResult {
  success: boolean
  redactedImageBase64?: string
  matches: RedactionMatch[]
  errors?: string[]
  processingTimeMs: number
}

/**
 * Document type
 */
export type DocumentType = 'ID' | 'DRIVERS_LICENSE' | 'PASSPORT' | 'UNKNOWN'

/**
 * Document side
 */
export type DocumentSide = 'FRONT' | 'BACK'

/**
 * Redaction options
 */
export interface RedactionOptions {
  documentType?: DocumentType
  side?: DocumentSide
  
  // What to redact
  redactBSN?: boolean
  redactDateOfBirth?: boolean
  redactMRZ?: boolean
  redactFaces?: boolean
  redactDocumentNumber?: boolean
  
  // OCR settings
  ocrLanguages?: string[]  // e.g., ['nld', 'eng']
  ocrConfidenceThreshold?: number
  
  // Redaction style
  redactionColor?: string  // default: '#000000'
  addWatermark?: boolean
  watermarkText?: string
  
  // Debug
  debug?: boolean
}

/**
 * Face detection result
 */
export interface FaceDetection {
  bbox: BoundingBox
  confidence: number
  landmarks?: {
    leftEye: { x: number; y: number }
    rightEye: { x: number; y: number }
    nose: { x: number; y: number }
    mouthLeft: { x: number; y: number }
    mouthRight: { x: number; y: number }
  }
}

