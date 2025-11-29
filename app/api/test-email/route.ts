import { NextRequest, NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email"

/**
 * Test Email Endpoint
 * 
 * Test of email sending werkt via Resend
 * 
 * Usage:
 * GET /api/test-email?to=jouw@email.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const toEmail = searchParams.get("to")

    if (!toEmail) {
      return NextResponse.json(
        {
          error: "Missing 'to' parameter",
          usage: "GET /api/test-email?to=your@email.com",
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(toEmail)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
          provided: toEmail,
        },
        { status: 400 }
      )
    }

    // Check environment variables
    const hasResendKey = !!process.env.RESEND_API_KEY
    const hasSmtp = !!process.env.SMTP_HOST
    const fromEmail = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "support@proefrit-autoofy.nl"
    const fromName = process.env.FROM_NAME || process.env.RESEND_FROM_NAME || "Autoofy"
    const baseUrl = process.env.NEXTAUTH_URL || "https://proefrit-autoofy.nl"

    console.log("\n🔍 Email Configuration Check:")
    console.log(`   RESEND_API_KEY: ${hasResendKey ? '✅ Set' : '❌ NOT SET'}`)
    console.log(`   SMTP_HOST: ${hasSmtp ? '✅ Set' : '❌ NOT SET'}`)
    console.log(`   FROM_EMAIL: ${fromEmail}`)
    console.log(`   FROM_NAME: ${fromName}`)
    console.log(`   BASE_URL: ${baseUrl}`)
    console.log(`   TO_EMAIL: ${toEmail}\n`)

    if (!hasResendKey && !hasSmtp) {
      return NextResponse.json(
        {
          error: "No email service configured",
          details: {
            hasResendKey: false,
            hasSmtp: false,
            message: "Set RESEND_API_KEY or SMTP settings in environment variables",
          },
        },
        { status: 500 }
      )
    }

    // Try to send test verification email
    console.log(`📧 Attempting to send test email to: ${toEmail}`)
    
    const result = await sendVerificationEmail(
      toEmail,
      "test-token-12345",
      "Test User"
    )

    if (result.success) {
      console.log("✅ Email sent successfully!")
      return NextResponse.json({
        success: true,
        message: `✅ Test email verzonden naar ${toEmail}!`,
        details: "Check je inbox (en spam folder)",
        config: {
          fromEmail,
          fromName,
          baseUrl,
          provider: hasSmtp ? "SMTP" : "Resend",
        },
        data: result.data,
      })
    } else {
      console.error("❌ Email sending failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          config: {
            fromEmail,
            fromName,
            baseUrl,
            provider: hasSmtp ? "SMTP" : "Resend",
          },
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Test email error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
