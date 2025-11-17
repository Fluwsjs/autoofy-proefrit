import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generatePasswordResetToken, getPasswordResetTokenExpiry } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email"
import { passwordResetRateLimit } from "@/lib/rate-limit"

const forgotPasswordSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres").trim().toLowerCase(),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await passwordResetRateLimit(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { tenant: true },
    })

    // Don't reveal if email exists or not (security best practice)
    // Always return success, even if user doesn't exist
    if (user) {
      // Delete existing password reset token if any
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      })

      // Generate new password reset token
      const resetToken = generatePasswordResetToken()
      const expiresAt = getPasswordResetTokenExpiry()

      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      })

      // Send password reset email (don't await - fire and forget)
      sendPasswordResetEmail(user.email, resetToken, user.name).catch((error) => {
        console.error("Failed to send password reset email:", error)
      })
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        message: "Als dit e-mailadres bij ons geregistreerd is, ontvangt u een e-mail met instructies om uw wachtwoord te resetten.",
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

