import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sanitizeString } from "@/lib/sanitize"

const updateSellerSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(100).optional(),
  email: z.string().email("Ongeldig emailadres").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
})

// GET - Fetch a single seller
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
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

    const seller = await prisma.seller.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    })

    if (!seller) {
      return NextResponse.json({ error: "Verkoper niet gevonden" }, { status: 404 })
    }

    return NextResponse.json(seller)
  } catch (error) {
    console.error("Error fetching seller:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

// PUT - Update a seller
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session?.user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const body = await request.json()
    
    const sanitizedBody = {
      name: body.name ? sanitizeString(body.name) : undefined,
      email: body.email?.trim() || "",
      phone: body.phone?.trim() || "",
    }
    
    const validatedData = updateSellerSchema.parse(sanitizedBody)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { tenantId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 })
    }

    // Verify seller belongs to tenant
    const existingSeller = await prisma.seller.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    })

    if (!existingSeller) {
      return NextResponse.json({ error: "Verkoper niet gevonden" }, { status: 404 })
    }

    // Check for duplicate name (if name is being changed)
    if (validatedData.name && validatedData.name !== existingSeller.name) {
      const duplicateSeller = await prisma.seller.findFirst({
        where: {
          tenantId: user.tenantId,
          name: validatedData.name,
          isActive: true,
          NOT: { id },
        },
      })

      if (duplicateSeller) {
        return NextResponse.json(
          { error: "Er bestaat al een verkoper met deze naam" },
          { status: 400 }
        )
      }
    }

    const seller = await prisma.seller.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
      },
    })

    return NextResponse.json(seller)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating seller:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete a seller
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
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

    // Verify seller belongs to tenant
    const seller = await prisma.seller.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    })

    if (!seller) {
      return NextResponse.json({ error: "Verkoper niet gevonden" }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.seller.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Verkoper verwijderd" })
  } catch (error) {
    console.error("Error deleting seller:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

