import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/auth-utils"
import { resendVerificationEmail } from "@/lib/email"
import { emailVerificationRateLimit } from "@/lib/rate-limit"
import { sanitizeEmail } from "@/lib/sanitize"

const resendVerificationSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres").trim().toLowerCase(),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await emailVerificationRateLimit(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()
    const sanitizedBody = {
      email: sanitizeEmail(body.email || ""),
    }
    
    const validatedData = resendVerificationSchema.parse(sanitizedBody)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { tenant: true },
    })

    // Don't reveal if email exists or not (security best practice)
    // Always return success, even if user doesn't exist or is already verified
    if (user && !user.emailVerified) {
      // Delete existing verification token if any
      await prisma.verificationToken.deleteMany({
        where: { userId: user.id },
      })

      // Generate new verification token
      const verificationToken = generateVerificationToken()
      const expiresAt = getVerificationTokenExpiry()

      await prisma.verificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt,
        },
      })

      // Send verification email
      const emailResult = await resendVerificationEmail(
        user.email,
        verificationToken,
        user.name
      )

      if (!emailResult.success) {
        console.error("Failed to resend verification email:", emailResult.error)
        // Still return success to prevent email enumeration
      } else {
        console.log("Verification email resent successfully")
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        message: "Als dit e-mailadres bij ons geregistreerd is en nog niet geverifieerd, ontvangt u een nieuwe verificatie e-mail.",
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

    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

