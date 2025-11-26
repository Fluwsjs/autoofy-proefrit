/**
 * Pattern Detection for Sensitive Information
 * 
 * Regex patterns and detection logic for:
 * - Date of birth
 * - MRZ (Machine Readable Zone)
 * - Document numbers
 * - License numbers
 */

import type { RedactionMatch, BoundingBox } from './types'

/**
 * Date patterns (common Dutch/EU formats)
 */
export const DATE_PATTERNS = [
  // dd-mm-yyyy, dd/mm/yyyy, dd.mm.yyyy
  /\b(0[1-9]|[12][0-9]|3[01])[\-\/\.](0[1-9]|1[0-2])[\-\/\.]([12]\d{3})\b/g,
  // yyyy-mm-dd
  /\b([12]\d{3})[\-\/\.](0[1-9]|1[0-2])[\-\/\.](0[1-9]|[12][0-9]|3[01])\b/g,
  // dd-mm-yy, dd/mm/yy
  /\b(0[1-9]|[12][0-9]|3[01])[\-\/\.](0[1-9]|1[0-2])[\-\/\.](\d{2})\b/g,
]

/**
 * MRZ (Machine Readable Zone) pattern
 * Typically 30-44 uppercase letters, digits, and '<' characters
 */
export const MRZ_PATTERN = /^[A-Z0-9<]{30,}$/gm

/**
 * Dutch driving license number pattern
 * Format: 10 digits (punt 5 op rijbewijs)
 */
export const NL_LICENSE_PATTERNS = [
  /\b\d{10}\b/g,                        // 10 digits (most common)
  /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b/g, // 10 digits with separators
]

/**
 * Document number patterns
 * Includes both ID numbers and driving license numbers
 */
export const DOCUMENT_NUMBER_PATTERNS = [
  /\b\d{10}\b/g,                       // 10 digits (rijbewijs)
  /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b/g, // 10 digits with separators
  /\b[A-Z]{2}[A-Z0-9]{6,8}\b/g,        // NL ID/Passport format
  /\bID[A-Z0-9]{6,10}\b/g,             // ID with prefix
  /\b[A-Z]{1,2}\d{6,10}\b/g,           // Variant formats
]

/**
 * Detect dates in OCR text
 */
export function detectDatesInOCR(
  ocrText: string,
  words: Array<{ text: string; bbox: BoundingBox; confidence: number }>
): RedactionMatch[] {
  const matches: RedactionMatch[] = []
  
  for (const pattern of DATE_PATTERNS) {
    const dateMatches = ocrText.matchAll(pattern)
    
    for (const match of dateMatches) {
      const dateText = match[0]
      
      // Find the word(s) containing this date
      const matchingWords = findWordsContainingText(words, dateText)
      
      if (matchingWords.length > 0) {
        const bbox = getBoundingBoxForWords(matchingWords)
        
        // Check if this looks like a date of birth (heuristic)
        const isLikelyBirthDate = isLikelyDateOfBirth(dateText, ocrText)
        
        if (isLikelyBirthDate) {
          matches.push({
            type: 'DATE_OF_BIRTH',
            text: dateText,
            bbox,
            confidence: Math.min(...matchingWords.map(w => w.confidence)),
            reason: 'Date detected near birth/geboren keywords',
          })
        }
      }
    }
  }
  
  return matches
}

/**
 * Detect MRZ (Machine Readable Zone) lines
 */
export function detectMRZInOCR(
  ocrText: string,
  lines: Array<{ text: string; bbox: BoundingBox }>
): RedactionMatch[] {
  const matches: RedactionMatch[] = []
  
  for (const line of lines) {
    // Check if line matches MRZ pattern
    if (MRZ_PATTERN.test(line.text)) {
      matches.push({
        type: 'MRZ',
        text: line.text.substring(0, 10) + '...',  // Don't log full MRZ
        bbox: expandBoundingBox(line.bbox, 5),  // Add padding
        confidence: 1.0,
        reason: 'MRZ line detected',
      })
    }
  }
  
  return matches
}

/**
 * Detect document numbers (including driving license numbers)
 */
export function detectDocumentNumbersInOCR(
  ocrText: string,
  words: Array<{ text: string; bbox: BoundingBox; confidence: number }>
): RedactionMatch[] {
  const matches: RedactionMatch[] = []
  const seenTexts = new Set<string>() // Prevent duplicates
  
  for (const pattern of DOCUMENT_NUMBER_PATTERNS) {
    const numberMatches = ocrText.matchAll(pattern)
    
    for (const match of numberMatches) {
      const numberText = match[0]
      const normalized = numberText.replace(/\D/g, '') // Remove non-digits for comparison
      
      // Skip if already matched
      if (seenTexts.has(normalized)) {
        continue
      }
      
      const matchingWords = findWordsContainingText(words, numberText)
      
      if (matchingWords.length > 0) {
        const bbox = getBoundingBoxForWords(matchingWords)
        
        // Determine if this is likely a driving license number (10 digits)
        const isLicenseNumber = normalized.length === 10
        
        matches.push({
          type: isLicenseNumber ? 'LICENSE_NUMBER' : 'DOCUMENT_NUMBER',
          text: numberText.substring(0, 4) + '***',  // Partially hide for logging
          bbox,
          confidence: Math.min(...matchingWords.map(w => w.confidence)),
          reason: isLicenseNumber ? 'Driving license number (10 digits)' : 'Document number pattern detected',
        })
        
        seenTexts.add(normalized)
      }
    }
  }
  
  return matches
}

/**
 * Heuristic to determine if a date is likely a date of birth
 */
function isLikelyDateOfBirth(dateText: string, fullText: string): boolean {
  // Convert to lowercase for comparison
  const lowerText = fullText.toLowerCase()
  const dateIndex = lowerText.indexOf(dateText.toLowerCase())
  
  if (dateIndex === -1) return false
  
  // Check for nearby keywords
  const contextBefore = lowerText.substring(Math.max(0, dateIndex - 50), dateIndex)
  const contextAfter = lowerText.substring(dateIndex, Math.min(lowerText.length, dateIndex + 50))
  const context = contextBefore + ' ' + contextAfter
  
  const birthKeywords = [
    'geboren',
    'geb',
    'birth',
    'date of birth',
    'dob',
    '3.',  // Often field 3 on IDs
    '4b',  // Expiry date field (we want to avoid this)
  ]
  
  // Check for birth-related keywords
  for (const keyword of birthKeywords) {
    if (context.includes(keyword)) {
      // Make sure it's not an expiry date
      if (keyword === '4b' || context.includes('geldig') || context.includes('expir')) {
        continue
      }
      return true
    }
  }
  
  // Check if date is in reasonable birth range (1920-2010 for adults)
  const year = extractYear(dateText)
  if (year && year >= 1920 && year <= 2010) {
    return true
  }
  
  return false
}

/**
 * Extract year from date string
 */
function extractYear(dateText: string): number | null {
  // Try to find a 4-digit year
  const yearMatch = dateText.match(/[12]\d{3}/)
  if (yearMatch) {
    return parseInt(yearMatch[0], 10)
  }
  
  // Try 2-digit year
  const shortYearMatch = dateText.match(/\d{2}$/)
  if (shortYearMatch) {
    const shortYear = parseInt(shortYearMatch[0], 10)
    // Assume 1900s for 50-99, 2000s for 00-49
    return shortYear >= 50 ? 1900 + shortYear : 2000 + shortYear
  }
  
  return null
}

/**
 * Find words that contain the given text (fuzzy matching)
 */
function findWordsContainingText(
  words: Array<{ text: string; bbox: BoundingBox; confidence: number }>,
  searchText: string
): typeof words {
  const normalized = searchText.replace(/\D/g, '')
  const matchingWords: typeof words = []
  
  let accumulated = ''
  let currentWords: typeof words = []
  
  for (const word of words) {
    const wordDigits = word.text.replace(/\D/g, '')
    accumulated += wordDigits
    currentWords.push(word)
    
    if (accumulated.includes(normalized)) {
      return currentWords
    }
    
    // Reset if accumulated too much
    if (accumulated.length > normalized.length + 5) {
      accumulated = wordDigits
      currentWords = [word]
    }
  }
  
  // Fallback: find words that partially match
  for (const word of words) {
    if (word.text.includes(searchText) || searchText.includes(word.text)) {
      matchingWords.push(word)
    }
  }
  
  return matchingWords
}

/**
 * Calculate bounding box for multiple words
 */
function getBoundingBoxForWords(words: Array<{ bbox: BoundingBox }>): BoundingBox {
  if (words.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  if (words.length === 1) {
    return expandBoundingBox(words[0].bbox, 5)
  }
  
  const minX = Math.min(...words.map(w => w.bbox.x))
  const minY = Math.min(...words.map(w => w.bbox.y))
  const maxX = Math.max(...words.map(w => w.bbox.x + w.bbox.width))
  const maxY = Math.max(...words.map(w => w.bbox.y + w.bbox.height))
  
  return expandBoundingBox({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }, 5)
}

/**
 * Expand bounding box by padding
 */
function expandBoundingBox(bbox: BoundingBox, padding: number): BoundingBox {
  return {
    x: Math.max(0, bbox.x - padding),
    y: Math.max(0, bbox.y - padding),
    width: bbox.width + (padding * 2),
    height: bbox.height + (padding * 2),
  }
}

