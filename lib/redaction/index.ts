/**
 * Document Redaction System
 * 
 * OCR-based privacy-first redaction for Dutch ID documents and driving licenses.
 * 
 * Features:
 * - BSN detection with elfproef validation
 * - Date of birth detection
 * - MRZ (Machine Readable Zone) detection
 * - Face/photo redaction
 * - Document number redaction
 * 
 * Usage:
 * ```typescript
 * import { redactDocumentWithOCR } from '@/lib/redaction'
 * 
 * const result = await redactDocumentWithOCR(imageBase64, {
 *   redactBSN: true,
 *   redactDateOfBirth: true,
 *   redactFaces: false,
 * })
 * 
 * if (result.success) {
 *   // Use result.redactedImageBase64
 * }
 * ```
 */

// Main exports
export { redactDocumentWithOCR, validateImageForOCR } from './ocrRedactor'
export { isValidBSN, findValidBSNs, detectBSNInOCR } from './bsn'
export { 
  detectDatesInOCR, 
  detectMRZInOCR, 
  detectDocumentNumbersInOCR 
} from './patterns'
export { 
  detectFaceInDocument, 
  redactFaces 
} from './faceDetection'
export {
  addFallbackZones,
  getFallbackZones,
  getImageDimensions
} from './hybridRedaction'

// Type exports
export type {
  BoundingBox,
  OCRWord,
  OCRLine,
  RedactionMatch,
  RedactionResult,
  RedactionOptions,
  DocumentType,
  DocumentSide,
  FaceDetection,
} from './types'

