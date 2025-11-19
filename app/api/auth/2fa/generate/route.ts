import { NextRequest, NextResponse } from "next/server"
import { authenticator } from "otplib"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate secret only - QR code will be generated client-side
    const secret = authenticator.generateSecret()

    return NextResponse.json({
      secret
    })
  } catch (error) {
    console.error("Error generating 2FA secret:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
