/**
 * Server-side file upload validation utilities
 * Validates file types, sizes, and formats for security
 */

interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates base64 image data
 */
export function validateBase64Image(base64String: string): ValidationResult {
  // Check if string is empty
  if (!base64String || base64String.trim().length === 0) {
    return { valid: true } // Empty is valid (optional field)
  }

  // Check if it's a valid data URI
  const dataUriPattern = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/
  if (!dataUriPattern.test(base64String)) {
    return {
      valid: false,
      error: "Ongeldig afbeeldingsformaat. Alleen JPEG, PNG, WebP of GIF zijn toegestaan.",
    }
  }

  // Extract the base64 data
  const base64Data = base64String.split(",")[1]
  if (!base64Data) {
    return {
      valid: false,
      error: "Ongeldige base64 data.",
    }
  }

  // Calculate approximate file size (base64 is ~33% larger than binary)
  const sizeInBytes = (base64Data.length * 3) / 4
  const maxSizeInBytes = 5 * 1024 * 1024 // 5MB

  if (sizeInBytes > maxSizeInBytes) {
    return {
      valid: false,
      error: "Afbeelding is te groot. Maximum 5MB toegestaan.",
    }
  }

  // Check minimum size (to prevent empty or corrupt files)
  const minSizeInBytes = 100 // 100 bytes minimum
  if (sizeInBytes < minSizeInBytes) {
    return {
      valid: false,
      error: "Afbeelding is te klein of corrupt.",
    }
  }

  // Validate base64 format
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
  if (!base64Pattern.test(base64Data)) {
    return {
      valid: false,
      error: "Ongeldige base64 encoding.",
    }
  }

  // Try to decode base64 to validate it's valid data
  try {
    Buffer.from(base64Data, "base64")
  } catch (error) {
    return {
      valid: false,
      error: "Ongeldige base64 data.",
    }
  }

  return { valid: true }
}

/**
 * Validates multiple base64 images
 */
export function validateBase64Images(images: string[]): ValidationResult {
  for (const image of images) {
    if (image && image.trim().length > 0) {
      const result = validateBase64Image(image)
      if (!result.valid) {
        return result
      }
    }
  }

  // Check total size across all images
  const totalSize = images.reduce((total, image) => {
    if (!image || image.trim().length === 0) return total
    const base64Data = image.split(",")[1] || ""
    return total + (base64Data.length * 3) / 4
  }, 0)

  const maxTotalSize = 10 * 1024 * 1024 // 10MB total
  if (totalSize > maxTotalSize) {
    return {
      valid: false,
      error: "Totale bestandsgrootte te groot. Maximum 10MB totaal toegestaan.",
    }
  }

  return { valid: true }
}

/**
 * Validates MIME type from base64 data URI
 */
export function validateMimeType(base64String: string): ValidationResult {
  if (!base64String || base64String.trim().length === 0) {
    return { valid: true }
  }

  // Extract MIME type from data URI
  const mimeMatch = base64String.match(/^data:image\/([^;]+)/)
  if (!mimeMatch) {
    return {
      valid: false,
      error: "Ongeldig MIME type.",
    }
  }

  const mimeType = mimeMatch[1].toLowerCase()
  const allowedTypes = ["jpeg", "jpg", "png", "webp", "gif"]

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `MIME type '${mimeType}' is niet toegestaan. Alleen ${allowedTypes.join(", ")} zijn toegestaan.`,
    }
  }

  return { valid: true }
}

/**
 * Validates file size (in bytes)
 */
export function validateFileSize(sizeInBytes: number, maxSizeInMB: number = 5): ValidationResult {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  if (sizeInBytes > maxSizeInBytes) {
    return {
      valid: false,
      error: `Bestand is te groot. Maximum ${maxSizeInMB}MB toegestaan.`,
    }
  }

  if (sizeInBytes < 100) {
    return {
      valid: false,
      error: "Bestand is te klein of corrupt.",
    }
  }

  return { valid: true }
}

/**
 * Sanitize filename (remove dangerous characters)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\./, "_")
    .substring(0, 255) // Max filename length
}

/**
 * Validate signature image (specific validation for signature images)
 */
export function validateSignatureImage(base64String: string): ValidationResult {
  if (!base64String || base64String.trim().length === 0) {
    return { valid: true } // Signatures are optional in some cases
  }

  // Check basic base64 image validation
  const baseValidation = validateBase64Image(base64String)
  if (!baseValidation.valid) {
    return baseValidation
  }

  // Additional checks for signatures (could check dimensions, etc.)
  // For now, same as regular image validation

  return { valid: true }
}

