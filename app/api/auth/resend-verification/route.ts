import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailVerificationRateLimit } from "@/lib/rate-limit"
import { sanitizeEmail } from "@/lib/sanitize"
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/auth-utils"
import { resendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await emailVerificationRateLimit(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()
    const email = sanitizeEmail(body.email || "")

    if (!email) {
      return NextResponse.json(
        { error: "E-mailadres is verplicht" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: "Als dit e-mailadres bij ons bekend is, ontvangt u een nieuwe verificatie e-mail.",
      })
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Uw e-mailadres is al geverifieerd. U kunt inloggen.",
        alreadyVerified: true,
      })
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    })

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const tokenExpiresAt = getVerificationTokenExpiry()

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: tokenExpiresAt,
      },
    })

    // Send verification email
    console.log(`🔄 [RESEND] Sending verification email to: ${email}`)
    
    try {
      const emailResult = await resendVerificationEmail(
        email,
        verificationToken,
        user.name
      )

      if (emailResult.success) {
        console.log(`✅ [RESEND] Verification email sent successfully to: ${email}`)
      } else {
        console.error(`❌ [RESEND] Failed to send verification email to: ${email}`)
        console.error(`   Error: ${emailResult.error}`)
      }
    } catch (emailError) {
      console.error(`❌ [RESEND] Exception sending verification email:`, emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Als dit e-mailadres bij ons bekend is, ontvangt u een nieuwe verificatie e-mail.",
    })

  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}
