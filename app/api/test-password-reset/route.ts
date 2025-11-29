import { NextRequest, NextResponse } from "next/server"
import { sendPasswordResetEmail } from "@/lib/email"

/**
 * Test Password Reset Email Endpoint
 * 
 * Test of password reset emails werken
 * 
 * Usage:
 * GET /api/test-password-reset?email=jouw@email.com&name=Test+User
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const name = searchParams.get("name") || "Test User"

    if (!email) {
      return NextResponse.json(
        {
          error: "Missing 'email' parameter",
          usage: "GET /api/test-password-reset?email=your@email.com&name=Your+Name",
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
          provided: email,
        },
        { status: 400 }
      )
    }

    console.log(`🔑 Testing password reset email to: ${email}`)

    // Try to send password reset email with test token
    const testToken = "test-reset-token-12345"
    const result = await sendPasswordResetEmail(email, testToken, name)

    if (result.success) {
      console.log("✅ Password reset email sent successfully!")
      return NextResponse.json({
        success: true,
        message: `✅ Password reset email verzonden naar ${email}!`,
        details: "Check je inbox (en spam folder)",
        resetUrl: `${process.env.NEXTAUTH_URL || 'https://proefrit-autoofy.nl'}/auth/reset-password?token=${testToken}`,
        data: result.data,
      })
    } else {
      console.error("❌ Password reset email sending failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: "Email verzenden mislukt",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Test password reset error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

