import { NextRequest, NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email"
import { generateVerificationToken } from "@/lib/auth-utils"

/**
 * Debug Verification Email Endpoint
 * 
 * Test sending a verification email identical to registration flow
 * 
 * Usage:
 * GET /api/debug-verification?email=your@email.com&name=YourName
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
          usage: "GET /api/debug-verification?email=your@email.com&name=YourName",
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

    // Generate a test token (same as registration)
    const verificationToken = generateVerificationToken()

    console.log("\n🔍 [DEBUG-VERIFICATION] Starting verification email test")
    console.log(`   Email: ${email}`)
    console.log(`   Name: ${name}`)
    console.log(`   Token: ${verificationToken.substring(0, 20)}...`)

    // Try to send verification email (EXACT same function as registration)
    console.log(`📧 [DEBUG-VERIFICATION] Calling sendVerificationEmail...`)
    
    const result = await sendVerificationEmail(
      email,
      verificationToken,
      name
    )

    console.log(`📊 [DEBUG-VERIFICATION] Result:`, result)

    if (result.success) {
      console.log("✅ [DEBUG-VERIFICATION] Email sent successfully!")
      return NextResponse.json({
        success: true,
        message: `✅ Verificatie email verzonden naar ${email}!`,
        details: "Check je inbox (en spam folder)",
        debugInfo: {
          emailFunction: "sendVerificationEmail",
          sameAsRegistration: true,
          tokenPreview: verificationToken.substring(0, 20) + "...",
        },
        result: {
          success: result.success,
          data: result.data,
        },
      })
    } else {
      console.error("❌ [DEBUG-VERIFICATION] Email sending failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          debugInfo: {
            emailFunction: "sendVerificationEmail",
            sameAsRegistration: true,
            tokenPreview: verificationToken.substring(0, 20) + "...",
          },
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ [DEBUG-VERIFICATION] Exception:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

