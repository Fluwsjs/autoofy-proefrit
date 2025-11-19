import { NextRequest, NextResponse } from "next/server"
import { authenticator } from "otplib"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifySchema = z.object({
  token: z.string().min(6).max(6),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { token } = verifySchema.parse(body)

    // Get user secret
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { twoFactorSecret: true }
    })

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA setup not started" },
        { status: 400 }
      )
    }

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    })

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      )
    }

    // Enable 2FA
    await prisma.user.update({
      where: { email: session.user.email },
      data: { twoFactorEnabled: true }
    })

    return NextResponse.json({ message: "2FA enabled successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }
    console.error("Error verifying 2FA:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

