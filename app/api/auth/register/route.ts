import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  tenantName: z.string().min(1, "Bedrijfsnaam is verplicht"),
  userName: z.string().min(1, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens lang zijn"),
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
        },
      })

      return { tenant, user }
    })

    return NextResponse.json(
      {
        message: "Autobedrijf en beheerder succesvol aangemaakt",
        tenantId: result.tenant.id,
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
      if (error.message.includes("Can't reach database server") || 
          error.message.includes("P1001") ||
          error.message.includes("connection")) {
        return NextResponse.json(
          { error: "Database connectie fout. Check DATABASE_URL in Netlify." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van het account" },
      { status: 500 }
    )
  }
}

