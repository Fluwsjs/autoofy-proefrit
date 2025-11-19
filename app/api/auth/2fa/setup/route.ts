import { NextRequest, NextResponse } from "next/server"
import { authenticator } from "otplib"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()

    // Generate otpauth URL
    const otpauth = authenticator.keyuri(
      session.user.email,
      "Autoofy",
      secret
    )

    // Store the secret temporarily
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false // Not enabled yet until verified
      }
    })

    // Return otpauth directly so client can generate QR code
    return NextResponse.json({
      secret,
      otpauth
    })
  } catch (error) {
    console.error("Error generating 2FA secret:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
