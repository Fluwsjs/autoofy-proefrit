import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { validatePasswordStrength } from "@/lib/password-validation"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is verplicht"),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens lang zijn")
    .regex(/[a-z]/, "Wachtwoord moet minimaal één kleine letter bevatten")
    .regex(/[A-Z]/, "Wachtwoord moet minimaal één hoofdletter bevatten")
    .regex(/\d/, "Wachtwoord moet minimaal één cijfer bevatten")
    .regex(/[^a-zA-Z\d]/, "Wachtwoord moet minimaal één speciaal teken bevatten"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Validate password strength
    const passwordValidation = validatePasswordStrength(validatedData.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] || "Wachtwoord is niet sterk genoeg" },
        { status: 400 }
      )
    }

    // Find password reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedData.token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Ongeldige of verlopen reset link" },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return NextResponse.json(
        { error: "De reset link is verlopen. Vraag een nieuwe aan." },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Update password and delete reset token in a transaction
    // Also verify email since user has proven they own this email address
    await prisma.$transaction(async (tx) => {
      // Update user password AND verify email (since they proved email ownership)
      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
          emailVerified: true,  // Password reset proves email ownership
          emailVerifiedAt: new Date(),
        },
      })

      // Delete reset token
      await tx.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      
      // Also delete any pending verification tokens for this user
      await tx.verificationToken.deleteMany({
        where: { userId: resetToken.userId },
      })
    })

    return NextResponse.json(
      {
        message: "Wachtwoord succesvol gereset. U kunt nu inloggen met uw nieuwe wachtwoord.",
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

    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het resetten van uw wachtwoord" },
      { status: 500 }
    )
  }
}

