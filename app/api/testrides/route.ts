import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const testrideSchema = z.object({
  customerName: z.string().min(1, "Klantnaam is verplicht"),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  customerPhone: z.string().optional(),
  address: z.string().min(1, "Adres is verplicht"),
  startTime: z.string(),
  endTime: z.string(),
  date: z.string(),
  carType: z.string().min(1, "Autotype is verplicht"),
  licensePlate: z.string().optional(),
  startKm: z.number().int().positive("Startkilometerstand moet positief zijn"),
  endKm: z.number().int().positive().optional(),
  signatureUrl: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const testrides = await prisma.testride.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(testrides)
  } catch (error) {
    console.error("Error fetching testrides:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen proefritten" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = testrideSchema.parse(body)

    const testride = await prisma.testride.create({
      data: {
        ...validatedData,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        date: new Date(validatedData.date),
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json(testride, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating testride:", error)
    return NextResponse.json(
      { error: "Fout bij aanmaken proefrit" },
      { status: 500 }
    )
  }
}

