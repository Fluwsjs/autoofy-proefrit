import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const dealerPlateSchema = z.object({
  plate: z.string().min(1, "Handelaarskenteken is verplicht"),
})

// GET: Haal alle handelaarskentekens op voor de ingelogde gebruiker
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const dealerPlates = await prisma.dealerPlate.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(dealerPlates)
  } catch (error) {
    console.error("Error fetching dealer plates:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen handelaarskentekens" },
      { status: 500 }
    )
  }
}

// POST: Maak nieuw handelaarskenteken aan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = dealerPlateSchema.parse(body)

    // Check if plate already exists for this user
    const existing = await prisma.dealerPlate.findFirst({
      where: {
        userId: session.user.id,
        plate: validatedData.plate,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Dit handelaarskenteken bestaat al" },
        { status: 400 }
      )
    }

    const dealerPlate = await prisma.dealerPlate.create({
      data: {
        plate: validatedData.plate,
        userId: session.user.id,
      },
    })

    return NextResponse.json(dealerPlate, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating dealer plate:", error)
    return NextResponse.json(
      { error: "Fout bij aanmaken handelaarskenteken" },
      { status: 500 }
    )
  }
}

