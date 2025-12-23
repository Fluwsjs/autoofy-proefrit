import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/auth-utils"
import { resendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, email } = body

    if (!userId && !email) {
      return NextResponse.json(
        { error: "userId of email is verplicht" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: userId 
        ? { id: userId }
        : { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: `${user.name} is al geverifieerd`,
        alreadyVerified: true,
      })
    }

    // Delete any existing verification tokens
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
    console.log(`📧 [ADMIN] Sending verification email to: ${user.email}`)
    
    const emailResult = await resendVerificationEmail(
      user.email,
      verificationToken,
      user.name
    )

    if (emailResult.success) {
      console.log(`✅ [ADMIN] Verification email sent successfully to: ${user.email}`)
      return NextResponse.json({
        success: true,
        message: `Verificatie e-mail verstuurd naar ${user.email}`,
      })
    } else {
      console.error(`❌ [ADMIN] Failed to send verification email: ${emailResult.error}`)
      return NextResponse.json({
        success: false,
        error: `E-mail versturen mislukt: ${emailResult.error}`,
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Admin resend verification error:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

