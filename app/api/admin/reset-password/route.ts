import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { validatePasswordStrength } from "@/lib/password-validation"

const resetPasswordSchema = z.object({
  userId: z.string().min(1, "Gebruiker ID is verplicht"),
  newPassword: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens lang zijn")
    .regex(/[a-z]/, "Wachtwoord moet minimaal één kleine letter bevatten")
    .regex(/[A-Z]/, "Wachtwoord moet minimaal één hoofdletter bevatten")
    .regex(/\d/, "Wachtwoord moet minimaal één cijfer bevatten")
    .regex(/[^a-zA-Z\d]/, "Wachtwoord moet minimaal één speciaal teken bevatten"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Validate password strength
    const passwordValidation = validatePasswordStrength(validatedData.newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] || "Wachtwoord is niet sterk genoeg" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: validatedData.userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json(
      { message: "Wachtwoord succesvol gereset" },
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
      { error: "Fout bij resetten wachtwoord" },
      { status: 500 }
    )
  }
}

