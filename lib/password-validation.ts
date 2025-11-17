/**
 * Password validation utilities
 * Consistent password requirements between frontend and backend
 */

export interface PasswordValidationResult {
  valid: boolean
  score: number // 0-100
  errors: string[]
  warnings: string[]
}

/**
 * Validate password strength
 * Returns validation result with score and errors
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    errors.push("Wachtwoord moet minimaal 8 tekens lang zijn")
  } else {
    score += 20
    if (password.length >= 12) {
      score += 10 // Bonus for longer passwords
    }
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push("Wachtwoord moet minimaal één kleine letter bevatten")
  } else {
    score += 15
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push("Wachtwoord moet minimaal één hoofdletter bevatten")
  } else {
    score += 15
  }

  // Digit check
  if (!/\d/.test(password)) {
    errors.push("Wachtwoord moet minimaal één cijfer bevatten")
  } else {
    score += 15
  }

  // Special character check
  if (!/[^a-zA-Z\d]/.test(password)) {
    errors.push("Wachtwoord moet minimaal één speciaal teken bevatten")
  } else {
    score += 15
  }

  // Additional checks for better security
  // Check for common patterns (weak passwords)
  const commonPatterns = [
    /(.)\1{3,}/, // Same character repeated 4+ times
    /12345|abcde|qwerty/i, // Sequential patterns
    /password|wachtwoord/i, // Common words
  ]

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      warnings.push("Wachtwoord bevat een veelvoorkomend patroon. Gebruik een uniek wachtwoord.")
      score = Math.max(0, score - 10)
    }
  }

  // Check for dictionary words (simple check)
  const commonWords = ["admin", "password", "wachtwoord", "test", "demo"]
  const lowerPassword = password.toLowerCase()
  for (const word of commonWords) {
    if (lowerPassword.includes(word)) {
      warnings.push("Vermijd veelvoorkomende woorden in uw wachtwoord.")
      score = Math.max(0, score - 5)
    }
  }

  // Minimum score requirement
  const minimumScore = 60
  const isValid = errors.length === 0 && score >= minimumScore

  if (!isValid && errors.length === 0 && score < minimumScore) {
    errors.push("Wachtwoord is niet sterk genoeg. Gebruik een combinatie van hoofdletters, kleine letters, cijfers en speciale tekens.")
  }

  return {
    valid: isValid,
    score: Math.min(100, Math.max(0, score)),
    errors,
    warnings,
  }
}


/**
 * Validate password and return detailed result
 * Use this in API routes to get validation details
 */
export function validatePassword(password: string): PasswordValidationResult {
  return validatePasswordStrength(password)
}

