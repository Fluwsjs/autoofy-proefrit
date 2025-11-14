import crypto from "crypto"

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Generate a secure random token for password reset
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Get expiration date for verification token (24 hours from now)
 */
export function getVerificationTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 24)
  return expiry
}

/**
 * Get expiration date for password reset token (1 hour from now)
 */
export function getPasswordResetTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 1)
  return expiry
}

