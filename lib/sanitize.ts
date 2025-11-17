/**
 * Input sanitization utilities
 * Prevents XSS attacks by sanitizing user input
 */

/**
 * Basic HTML entity encoding
 * Encodes special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Sanitize string input
 * Removes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "")

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "")

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "")

  // Remove data: URIs that might contain scripts
  sanitized = sanitized.replace(/data:text\/html/gi, "")

  // Trim whitespace
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Sanitize object recursively
 * Sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (sanitized.hasOwnProperty(key)) {
      const value = sanitized[key]

      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>]
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>]
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) => {
          if (typeof item === "string") {
            return sanitizeString(item)
          } else if (item && typeof item === "object") {
            return sanitizeObject(item as Record<string, unknown>)
          }
          return item
        }) as T[Extract<keyof T, string>]
      }
    }
  }

  return sanitized
}

/**
 * Sanitize text input (removes HTML)
 * Use for plain text fields like names, addresses, etc.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "")

  // Apply string sanitization
  sanitized = sanitizeString(sanitized)

  return sanitized
}

/**
 * Sanitize email address
 * Only allows valid email characters
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return ""
  }

  // Remove potentially dangerous characters, but keep email format
  let sanitized = email.trim().toLowerCase()

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\0\r\n\t]/g, "")

  // Basic email validation (simple check)
  // Allow only valid email characters
  sanitized = sanitized.replace(/[^a-z0-9@._-]/g, "")

  return sanitized
}

/**
 * Sanitize URL
 * Basic URL sanitization
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return ""
  }

  let sanitized = url.trim()

  // Remove dangerous protocols
  sanitized = sanitized.replace(/^(javascript|data|vbscript):/gi, "")

  // Basic sanitization
  sanitized = sanitizeString(sanitized)

  return sanitized
}

