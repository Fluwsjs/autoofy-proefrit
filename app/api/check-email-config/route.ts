import { NextResponse } from "next/server"

/**
 * Check Email Configuration Endpoint
 * 
 * Returns current email configuration (without exposing sensitive data)
 * 
 * Usage:
 * GET /api/check-email-config
 */
export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY
  const hasSmtp = !!process.env.SMTP_HOST
  const fromEmail = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "support@proefrit-autoofy.nl"
  const fromName = process.env.FROM_NAME || process.env.RESEND_FROM_NAME || "Autoofy"
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://proefrit-autoofy.nl"

  // Mask API key (show only first 5 chars)
  const resendKeyPreview = hasResendKey 
    ? `${process.env.RESEND_API_KEY!.substring(0, 8)}...` 
    : "NOT SET"

  const config = {
    emailServiceConfigured: hasResendKey || hasSmtp,
    providers: {
      resend: {
        configured: hasResendKey,
        apiKeyPreview: resendKeyPreview,
      },
      smtp: {
        configured: hasSmtp,
        host: process.env.SMTP_HOST || "NOT SET",
        port: process.env.SMTP_PORT || "NOT SET",
      },
    },
    emailSettings: {
      fromEmail,
      fromName,
      baseUrl,
    },
    validation: {
      hasValidProvider: hasResendKey || hasSmtp,
      fromEmailDomain: fromEmail.split('@')[1],
      isProefritDomain: fromEmail.includes('@proefrit-autoofy.nl'),
      baseUrlProtocol: baseUrl.split('://')[0],
      baseUrlIsHttps: baseUrl.startsWith('https://'),
    },
  }

  // Check for common issues
  const issues = []
  const warnings = []

  if (!hasResendKey && !hasSmtp) {
    issues.push("❌ No email service configured (neither Resend nor SMTP)")
  }

  if (!config.validation.isProefritDomain) {
    warnings.push(`⚠️ FROM_EMAIL domain is "${config.validation.fromEmailDomain}" but should be "proefrit-autoofy.nl"`)
  }

  if (!config.validation.baseUrlIsHttps && process.env.NODE_ENV === 'production') {
    warnings.push("⚠️ BASE_URL should use HTTPS in production")
  }

  if (baseUrl.endsWith('/')) {
    warnings.push("⚠️ BASE_URL should not have trailing slash")
  }

  return NextResponse.json({
    status: issues.length === 0 ? "✅ OK" : "❌ ISSUES FOUND",
    config,
    issues,
    warnings,
    recommendations: issues.length > 0 || warnings.length > 0 ? [
      "1. Set RESEND_API_KEY in Netlify environment variables",
      "2. Set RESEND_FROM_EMAIL to an email ending with @proefrit-autoofy.nl",
      "3. Set NEXTAUTH_URL to https://proefrit-autoofy.nl (no trailing slash)",
      "4. Redeploy after updating environment variables",
    ] : [],
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

