import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const superAdminSchema = z.object({
  name: z.string().min(1, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens lang zijn"),
})

// Deze route kan alleen lokaal worden aangeroepen of met een speciale secret
export async function POST(request: NextRequest) {
  try {
    // Check for secret key (basic security)
    const authHeader = request.headers.get("authorization")
    const secret = process.env.ADMIN_CREATE_SECRET || "create-admin-secret-change-in-production"
    
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = superAdminSchema.parse(body)

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email: validatedData.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Super admin met dit e-mailadres bestaat al" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create super admin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        message: "Super admin succesvol aangemaakt",
        id: superAdmin.id,
        email: superAdmin.email,
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

    console.error("Error creating super admin:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de super admin" },
      { status: 500 }
    )
  }
}

