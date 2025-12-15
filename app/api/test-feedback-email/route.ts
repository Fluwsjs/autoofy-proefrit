import { NextRequest, NextResponse } from "next/server"
import { sendFeedbackEmail } from "@/lib/email"

/**
 * Test endpoint for feedback email with form link
 * Usage: /api/test-feedback-email?to=customer@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const to = searchParams.get("to")

    if (!to) {
      return NextResponse.json(
        { 
          error: "Missing 'to' parameter",
          usage: "/api/test-feedback-email?to=customer@example.com"
        },
        { status: 400 }
      )
    }

    console.log(`📧 Testing feedback email...`)
    console.log(`   To: ${to}`)

    // Create a test feedback URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://proefrit-autoofy.nl"
    const testFeedbackUrl = `${baseUrl}/feedback/test-token-12345`

    const result = await sendFeedbackEmail(
      to,
      "Test Klant",
      "Test Autobedrijf BV",
      "BMW 3 Serie",
      testFeedbackUrl
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ Test feedback email verzonden naar ${to}`,
        feedbackUrl: testFeedbackUrl,
        note: "Controleer je inbox. Let op: de test-link in de email werkt niet (alleen voor test doeleinden)."
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: "❌ Fout bij verzenden test email"
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Test feedback email error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        message: "❌ Fout bij verzenden test email"
      },
      { status: 500 }
    )
  }
}
