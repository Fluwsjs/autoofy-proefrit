import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sanitizeString } from "@/lib/sanitize"

const sellerSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(100),
  email: z.string().email("Ongeldig emailadres").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
})

// GET - Fetch all sellers for the tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { tenantId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 })
    }

    const sellers = await prisma.seller.findMany({
      where: { 
        tenantId: user.tenantId,
        isActive: true,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { testrides: true }
        }
      }
    })

    return NextResponse.json({ data: sellers })
  } catch (error) {
    console.error("Error fetching sellers:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

// POST - Create a new seller
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const body = await request.json()
    
    // Sanitize and validate
    const sanitizedBody = {
      name: sanitizeString(body.name || ""),
      email: body.email?.trim() || "",
      phone: body.phone?.trim() || "",
    }
    
    const validatedData = sellerSchema.parse(sanitizedBody)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { tenantId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 })
    }

    // Check for duplicate name within tenant
    const existingSeller = await prisma.seller.findFirst({
      where: {
        tenantId: user.tenantId,
        name: validatedData.name,
        isActive: true,
      },
    })

    if (existingSeller) {
      return NextResponse.json(
        { error: "Er bestaat al een verkoper met deze naam" },
        { status: 400 }
      )
    }

    const seller = await prisma.seller.create({
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        tenantId: user.tenantId,
      },
    })

    return NextResponse.json(seller, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating seller:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

