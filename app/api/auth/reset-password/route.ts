import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is verplicht"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens lang zijn"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

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
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
        },
      })

      // Delete reset token
      await tx.passwordResetToken.delete({
        where: { id: resetToken.id },
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

