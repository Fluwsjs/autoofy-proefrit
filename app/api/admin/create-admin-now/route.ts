import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Eenmalige route om snel een super admin aan te maken
// Gebruik: POST /api/admin/create-admin-now met body: { name, email, password }
// BELANGRIJK: Verwijder deze route na gebruik of beveilig deze goed!
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Naam, e-mail en wachtwoord zijn verplicht" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Wachtwoord moet minimaal 6 tekens lang zijn" },
        { status: 400 }
      )
    }

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Super admin met dit e-mailadres bestaat al" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create super admin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        message: "Super admin succesvol aangemaakt!",
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        note: "Je kunt nu inloggen met dit account. Verwijder deze route na gebruik!"
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating super admin:", error)
    return NextResponse.json(
      { error: error.message || "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

