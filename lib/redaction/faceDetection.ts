/**
 * Face Detection for Document Photos
 * 
 * This module provides face detection to redact/blur photos on ID documents.
 * Current implementation uses simple heuristics based on known document layouts.
 * 
 * TODO: Can be extended with face-api.js or similar libraries for more accurate detection.
 */

import type { FaceDetection, BoundingBox, DocumentType, DocumentSide } from './types'

/**
 * Detect face/photo region on ID documents using layout templates
 * 
 * This is a simplified approach using known positions.
 * For production, consider using face-api.js or similar.
 */
export async function detectFaceInDocument(
  imageBase64: string,
  documentType: DocumentType,
  side: DocumentSide
): Promise<FaceDetection[]> {
  console.log(`👤 Detecting face region for ${documentType} ${side}...`)
  
  // Load image to get dimensions
  const dimensions = await getImageDimensions(imageBase64)
  
  // Use template-based detection
  const faceRegion = getFaceRegionByTemplate(documentType, side, dimensions)
  
  if (faceRegion) {
    console.log(`✅ Face region detected at x=${faceRegion.x}, y=${faceRegion.y}`)
    return [{
      bbox: faceRegion,
      confidence: 0.8,  // Template-based has reasonable confidence
    }]
  }
  
  console.log(`ℹ️ No face region template for ${documentType} ${side}`)
  return []
}

/**
 * Get face region based on document template
 * 
 * These are approximate positions for Dutch IDs and driving licenses.
 * Coordinates are in percentages (0-100).
 */
function getFaceRegionByTemplate(
  documentType: DocumentType,
  side: DocumentSide,
  dimensions: { width: number; height: number }
): BoundingBox | null {
  const { width, height } = dimensions
  
  // Templates for Dutch documents (percentages)
  const templates: Record<string, { x: number; y: number; width: number; height: number }> = {
    'ID_FRONT': {
      x: 60,      // Right side of document
      y: 15,      // Top portion
      width: 35,  // Photo width
      height: 45, // Photo height
    },
    'DRIVERS_LICENSE_FRONT': {
      x: 65,      // Right side
      y: 10,      // Top
      width: 30,  // Smaller photo
      height: 40,
    },
    // Back sides typically don't have photos
  }
  
  const key = `${documentType}_${side}`
  const template = templates[key]
  
  if (!template) {
    return null
  }
  
  // Convert percentages to pixels
  return {
    x: (template.x / 100) * width,
    y: (template.y / 100) * height,
    width: (template.width / 100) * width,
    height: (template.height / 100) * height,
  }
}

/**
 * Get image dimensions from base64
 */
function getImageDimensions(imageBase64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
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

/**
 * Apply redaction to face regions
 * Options: black box or blur
 */
export async function redactFaces(
  imageBase64: string,
  faces: FaceDetection[],
  method: 'blackbox' | 'blur' = 'blackbox'
): Promise<string> {
  if (faces.length === 0) {
    return imageBase64
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      for (const face of faces) {
        if (method === 'blackbox') {
          // Draw black rectangle over face
          ctx.fillStyle = '#000000'
          ctx.fillRect(face.bbox.x, face.bbox.y, face.bbox.width, face.bbox.height)
        } else if (method === 'blur') {
          // Apply blur effect (simplified)
          // For a real implementation, use a proper blur filter
          ctx.filter = 'blur(20px)'
          ctx.drawImage(
            canvas,
            face.bbox.x, face.bbox.y, face.bbox.width, face.bbox.height,
            face.bbox.x, face.bbox.y, face.bbox.width, face.bbox.height
          )
          ctx.filter = 'none'
        }
      }
      
      const redactedBase64 = canvas.toDataURL('image/jpeg', 0.92)
      resolve(redactedBase64)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageBase64
  })
}

/**
 * Future: Advanced face detection using face-api.js
 * 
 * To implement:
 * 1. npm install face-api.js
 * 2. Load models
 * 3. Run detection
 * 
 * Example:
 * ```typescript
 * import * as faceapi from 'face-api.js'
 * 
 * export async function detectFacesWithAI(imageBase64: string): Promise<FaceDetection[]> {
 *   await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
 *   const img = await faceapi.fetchImage(imageBase64)
 *   const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
 *   
 *   return detections.map(d => ({
 *     bbox: {
 *       x: d.box.x,
 *       y: d.box.y,
 *       width: d.box.width,
 *       height: d.box.height,
 *     },
 *     confidence: d.score,
 *   }))
 * }
 * ```
 */

