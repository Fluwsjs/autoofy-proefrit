/**
 * Structured logging utility with data masking
 * Masks sensitive information in logs
 */

type LogLevel = "error" | "warn" | "info" | "debug"

interface LogContext {
  userId?: string
  requestId?: string
  [key: string]: unknown
}

/**
 * Mask email addresses in logs
 */
function maskEmail(email: string | undefined | null): string {
  if (!email || typeof email !== "string") return "***"
  
  const parts = email.split("@")
  if (parts.length !== 2) return "***"
  
  const [local, domain] = parts
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`
  }
  
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

/**
 * Mask tokens (keep first 3 and last 3 characters)
 */
function maskToken(token: string | undefined | null): string {
  if (!token || typeof token !== "string") return "***"
  if (token.length <= 6) return "***"
  
  return `${token.substring(0, 3)}***${token.substring(token.length - 3)}`
}

/**
 * Mask passwords (always show as ***)
 */
function maskPassword(password: unknown): string {
  return "***"
}

/**
 * Recursively mask sensitive fields in objects
 */
function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data
  
  if (typeof data !== "object") {
    return data
  }
  
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData)
  }
  
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "apiKey",
    "accessToken",
    "refreshToken",
    "authorization",
    "auth",
    "email",
  ]
  
  const masked: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      if (lowerKey.includes("email")) {
        masked[key] = maskEmail(value as string)
      } else if (lowerKey.includes("token") || lowerKey.includes("secret") || lowerKey.includes("key")) {
        masked[key] = maskToken(value as string)
      } else if (lowerKey.includes("password")) {
        masked[key] = maskPassword(value)
      } else {
        masked[key] = "***"
      }
    } else if (typeof value === "object") {
      masked[key] = maskSensitiveData(value)
    } else {
      masked[key] = value
    }
  }
  
  return masked
}

/**
 * Format log message based on environment
 */
function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? JSON.stringify(maskSensitiveData(context)) : ""
  
  if (process.env.NODE_ENV === "production") {
    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(contextStr && { context: JSON.parse(contextStr) }),
    })
  } else {
    // Human-readable format for development
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr ? ` ${contextStr}` : ""}`
  }
}

/**
 * Logger class with data masking
 */
class Logger {
  private shouldLog(level: LogLevel): boolean {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() || "info"
    const levels: LogLevel[] = ["error", "warn", "info", "debug"]
    const currentLevelIndex = levels.indexOf(envLevel as LogLevel)
    const requestedLevelIndex = levels.indexOf(level)
    
    return requestedLevelIndex <= currentLevelIndex
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog("error")) return
    
    const errorContext: LogContext = {
      ...context,
      ...(error instanceof Error && {
        error: {
          message: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
          name: error.name,
        },
      }),
    }
    
    console.error(formatMessage("error", message, errorContext))
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog("warn")) return
    console.warn(formatMessage("warn", message, context))
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog("info")) return
    console.log(formatMessage("info", message, context))
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return
    console.debug(formatMessage("debug", message, context))
  }
}

// Export singleton instance
export const logger = new Logger()

// Export utility functions for external use
export { maskEmail, maskToken, maskPassword, maskSensitiveData }

