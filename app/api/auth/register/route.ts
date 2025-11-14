import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/auth-utils"
import { sendVerificationEmail } from "@/lib/email"

const registerSchema = z.object({
  tenantName: z.string().min(1, "Bedrijfsnaam is verplicht").trim(),
  userName: z.string().min(1, "Uw naam is verplicht").trim(),
  email: z.string().email("Ongeldig e-mailadres").trim().toLowerCase(),
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
    const validatedData = registerSchema.parse(body)

    // Check if email already exists (as tenant or user)
    const existingTenant = await prisma.tenant.findUnique({
      where: { email: validatedData.email },
    })

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingTenant || existingUser) {
      return NextResponse.json(
        { error: "E-mailadres is al in gebruik" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create tenant and admin user in a transaction
    // Use the same email for both tenant and user
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.tenantName,
          email: validatedData.email,
        },
      })

      const user = await tx.user.create({
        data: {
          name: validatedData.userName,
          email: validatedData.email,
          password: hashedPassword,
          role: "ADMIN",
          tenantId: tenant.id,
          emailVerified: false,
        },
      })

      // Create verification token
      const verificationToken = generateVerificationToken()
      const expiresAt = getVerificationTokenExpiry()

      await tx.verificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt,
        },
      })

      // Send verification email (don't await - fire and forget for faster response)
      sendVerificationEmail(validatedData.email, verificationToken, validatedData.userName).catch(
        (error) => {
          console.error("Failed to send verification email:", error)
        }
      )

      return { tenant, user }
    })

    return NextResponse.json(
      {
        message: "Autobedrijf en beheerder succesvol aangemaakt. Controleer uw e-mail voor verificatie.",
        tenantId: result.tenant.id,
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      // Check for Prisma schema errors
      if (error.message.includes("Can't reach database server") || 
          error.message.includes("P1001") ||
          error.message.includes("connection")) {
        return NextResponse.json(
          { error: "Database connectie fout. Check DATABASE_URL." },
          { status: 500 }
        )
      }
      
      // Check for missing table/model errors
      if (error.message.includes("does not exist") ||
          error.message.includes("P2021") ||
          error.message.includes("Unknown model") ||
          error.message.includes("table") && error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Database schema niet up-to-date. Voer 'npx prisma db push' uit." },
          { status: 500 }
        )
      }
      
      // Return more specific error message
      return NextResponse.json(
        { error: error.message || "Er is een fout opgetreden bij het aanmaken van het account" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van het account" },
      { status: 500 }
    )
  }
}

