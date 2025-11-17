/**
 * Environment variables validation
 * Validates required environment variables at startup
 */

interface EnvConfig {
  [key: string]: {
    required: boolean
    type?: "string" | "number" | "boolean"
    default?: string | number | boolean
    description?: string
  }
}

const envConfig: EnvConfig = {
  DATABASE_URL: {
    required: true,
    type: "string",
    description: "PostgreSQL database connection URL",
  },
  NEXTAUTH_SECRET: {
    required: true,
    type: "string",
    description: "Secret key for NextAuth.js session encryption",
  },
  NEXTAUTH_URL: {
    required: true,
    type: "string",
    description: "Base URL of the application",
  },
  RESEND_API_KEY: {
    required: true,
    type: "string",
    description: "Resend API key for sending emails",
  },
  RESEND_FROM_EMAIL: {
    required: true,
    type: "string",
    description: "Email address to send emails from (must be verified in Resend)",
  },
  RESEND_FROM_NAME: {
    required: false,
    type: "string",
    default: "Autoofy",
    description: "Display name for email sender",
  },
  NODE_ENV: {
    required: false,
    type: "string",
    default: "development",
    description: "Node environment (development, production, test)",
  },
  ADMIN_CREATE_SECRET: {
    required: false,
    type: "string",
    description: "Secret for creating admin accounts (only in development)",
  },
  CRON_SECRET: {
    required: false,
    type: "string",
    description: "Secret for cron job authentication",
  },
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate environment variables
 * Returns validation result with errors and warnings
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const [key, config] of Object.entries(envConfig)) {
    const value = process.env[key]

    // Check if required variable is set
    if (config.required && !value) {
      errors.push(`Required environment variable ${key} is not set. ${config.description || ""}`)
      continue
    }

    // Check type if value is set
    if (value && config.type) {
      if (config.type === "number" && isNaN(Number(value))) {
        errors.push(`Environment variable ${key} must be a number, got: ${value}`)
      } else if (config.type === "boolean") {
        const validBooleans = ["true", "false", "1", "0"]
        if (!validBooleans.includes(value.toLowerCase())) {
          warnings.push(`Environment variable ${key} should be a boolean (true/false), got: ${value}`)
        }
      }
    }

    // Warn if optional variable is not set (but has a default)
    if (!config.required && !value && config.default !== undefined) {
      warnings.push(`Optional environment variable ${key} is not set. Using default: ${config.default}. ${config.description || ""}`)
    }
  }

  // Additional validation checks
  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgresql://")) {
    warnings.push("DATABASE_URL should start with 'postgresql://'. Verify database connection string.")
  }

  // Validate NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL)
    } catch {
      errors.push("NEXTAUTH_URL must be a valid URL")
    }
  }

  // Validate RESEND_FROM_EMAIL format
  if (process.env.RESEND_FROM_EMAIL) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(process.env.RESEND_FROM_EMAIL)) {
      errors.push("RESEND_FROM_EMAIL must be a valid email address")
    }
  }

  // Validate NODE_ENV values
  if (process.env.NODE_ENV) {
    const validEnvs = ["development", "production", "test"]
    if (!validEnvs.includes(process.env.NODE_ENV)) {
      warnings.push(`NODE_ENV should be one of: ${validEnvs.join(", ")}, got: ${process.env.NODE_ENV}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Assert environment variables are valid
 * Throws error if validation fails
 */
export function assertEnvironmentVariables(): void {
  const result = validateEnvironmentVariables()

  if (!result.valid) {
    const errorMessage = [
      "Environment variable validation failed:",
      ...result.errors.map((error) => `  - ${error}`),
      ...(result.warnings.length > 0
        ? ["\nWarnings:", ...result.warnings.map((warning) => `  - ${warning}`)]
        : []),
    ].join("\n")

    throw new Error(errorMessage)
  }

  // Log warnings if any
  if (result.warnings.length > 0) {
    console.warn("Environment variable warnings:")
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`))
  }
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: keyof typeof envConfig, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (value === undefined) {
    const config = envConfig[key]
    if (config?.required) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    if (config?.default !== undefined) {
      return String(config.default)
    }
    throw new Error(`Environment variable ${key} is not set and no default value is available`)
  }

  return value
}

