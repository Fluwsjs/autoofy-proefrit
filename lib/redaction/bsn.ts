/**
 * BSN (Burgerservicenummer) Detection and Validation
 * 
 * Dutch BSN numbers are 9 digits and must pass the "elfproef" (11-check).
 * This module provides utilities to detect and validate BSN numbers.
 */

import type { RedactionMatch, BoundingBox } from './types'

/**
 * BSN patterns to match
 * - 9 digits: 123456789
 * - With separators: 123.456.789 or 123-456-789 or 123 456 789
 */
export const BSN_PATTERNS = [
  /\b\d{9}\b/g,                                    // 123456789
  /\b\d{3}[\s\.\-]\d{3}[\s\.\-]\d{3}\b/g,        // 123.456.789 or 123-456-789 or 123 456 789
]

/**
 * Validate a BSN using the "elfproef" (11-check)
 * 
 * Algorithm:
 * - BSN = a1 a2 a3 a4 a5 a6 a7 a8 a9
 * - Weights: 9 8 7 6 5 4 3 2 -1
 * - Sum = a1*9 + a2*8 + a3*7 + a4*6 + a5*5 + a6*4 + a7*3 + a8*2 + a9*(-1)
 * - Valid if: Sum % 11 === 0
 * 
 * @param bsn - BSN number as string (can contain separators)
 * @returns true if valid BSN, false otherwise
 * 
 * @example
 * isValidBSN('123456782') // true
 * isValidBSN('123.456.782') // true
 * isValidBSN('123456789') // false
 */
export function isValidBSN(bsn: string): boolean {
  // Remove all non-digit characters
  const digits = bsn.replace(/\D/g, '')
  
  // Must be exactly 9 digits
  if (digits.length !== 9) {
    return false
  }
  
  // Cannot be all zeros
  if (digits === '000000000') {
    return false
  }
  
  // Apply elfproef (11-check)
  const numbers = digits.split('').map(Number)
  const weights = [9, 8, 7, 6, 5, 4, 3, 2, -1]
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * weights[i]
  }
  
  return sum % 11 === 0
}

/**
 * Extract all potential BSN numbers from text
 * 
 * @param text - Text to search for BSN patterns
 * @returns Array of potential BSN numbers (normalized to digits only)
 */
export function extractPotentialBSNs(text: string): string[] {
  const potentialBSNs: string[] = []
  
  for (const pattern of BSN_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const normalized = match[0].replace(/\D/g, '')
      if (normalized.length === 9) {
        potentialBSNs.push(normalized)
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(potentialBSNs)]
}

/**
 * Find and validate BSN numbers in text
 * 
 * @param text - Text to search
 * @returns Array of validated BSN numbers
 */
export function findValidBSNs(text: string): string[] {
  const potential = extractPotentialBSNs(text)
  return potential.filter(isValidBSN)
}

/**
 * Detect BSN numbers in OCR results
 * 
 * @param ocrText - Full OCR text
 * @param words - OCR words with bounding boxes
 * @returns Array of redaction matches for BSN numbers
 */
export function detectBSNInOCR(
  ocrText: string,
  words: Array<{ text: string; bbox: BoundingBox; confidence: number }>
): RedactionMatch[] {
  const matches: RedactionMatch[] = []
  const validBSNs = findValidBSNs(ocrText)
  
  if (validBSNs.length === 0) {
    return matches
  }
  
  console.log(`✅ Found ${validBSNs.length} valid BSN(s):`, validBSNs.map(bsn => bsn.slice(0, 3) + '***' + bsn.slice(-2)))
  
  // For each validated BSN, find its location in the OCR words
  for (const bsn of validBSNs) {
    // Try to find words that contain parts of this BSN
    const bsnDigits = bsn.split('')
    let matchedWords: typeof words = []
    let searchText = ''
    
    // Look for consecutive words that form the BSN
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const wordDigits = word.text.replace(/\D/g, '')
      
      if (wordDigits.length > 0) {
        searchText += wordDigits
        matchedWords.push(word)
        
        // Check if we've found the complete BSN
        if (searchText.includes(bsn)) {
          // Calculate bounding box that encompasses all matched words
          const bbox = getBoundingBoxForWords(matchedWords)
          
          matches.push({
            type: 'BSN',
            text: bsn,
            bbox,
            confidence: Math.min(...matchedWords.map(w => w.confidence)),
            reason: 'Valid BSN detected (elfproef passed)',
          })
          
          // Reset for next potential BSN
          matchedWords = []
          searchText = ''
          break
        }
        
        // If we've collected too many digits, reset
        if (searchText.length > 12) {
          matchedWords = []
          searchText = ''
        }
      }
    }
  }
  
  return matches
}

/**
 * Calculate a bounding box that encompasses multiple words
 */
function getBoundingBoxForWords(words: Array<{ bbox: BoundingBox }>): BoundingBox {
  if (words.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  if (words.length === 1) {
    return words[0].bbox
  }
  
  // Find the min/max coordinates
  const minX = Math.min(...words.map(w => w.bbox.x))
  const minY = Math.min(...words.map(w => w.bbox.y))
  const maxX = Math.max(...words.map(w => w.bbox.x + w.bbox.width))
  const maxY = Math.max(...words.map(w => w.bbox.y + w.bbox.height))
  
  // Add some padding
  const padding = 5
  
  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: maxX - minX + (padding * 2),
    height: maxY - minY + (padding * 2),
  }
}

/**
 * Test cases for BSN validation
 * (These are example BSNs for testing - not real)
 */
export const TEST_BSNS = {
  valid: [
    '111222333',  // Valid elfproef
    '123456782',  // Valid elfproef
  ],
  invalid: [
    '123456789',  // Invalid elfproef
    '000000000',  // All zeros
    '12345678',   // Too short
    '1234567890', // Too long
  ],
}

