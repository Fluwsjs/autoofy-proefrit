import { NextRequest, NextResponse } from "next/server"
import { sendFeedbackEmail } from "@/lib/email"

/**
 * Test endpoint for feedback email with Reply-To
 * Usage: /api/test-feedback-email?to=customer@example.com&replyTo=dealer@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const to = searchParams.get("to")
    const replyTo = searchParams.get("replyTo")

    if (!to) {
      return NextResponse.json(
        { 
          error: "Missing 'to' parameter",
          usage: "/api/test-feedback-email?to=customer@example.com&replyTo=dealer@example.com"
        },
        { status: 400 }
      )
    }

    console.log(`📧 Testing feedback email...`)
    console.log(`   To: ${to}`)
    console.log(`   Reply-To: ${replyTo || '(not set)'}`)

    const result = await sendFeedbackEmail(
      to,
      "Test Klant",
      "Test Autobedrijf BV",
      "BMW 3 Serie",
      replyTo || undefined
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ Test feedback email verzonden naar ${to}`,
        replyTo: replyTo || "niet ingesteld",
        note: "Controleer je inbox en test of de Reply-To functionaliteit werkt door op de email te antwoorden."
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

