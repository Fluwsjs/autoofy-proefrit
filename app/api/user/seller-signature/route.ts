import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const sellerSignatureSchema = z.object({
  signatureUrl: z.string().min(1, "Handtekening is verplicht"),
})

// GET: Haal verkoper handtekening op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { sellerSignatureUrl: true },
    })

    return NextResponse.json({
      signatureUrl: user?.sellerSignatureUrl || null,
    })
  } catch (error) {
    console.error("Error fetching seller signature:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen verkoper handtekening" },
      { status: 500 }
    )
  }
}

// POST: Sla verkoper handtekening op
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sellerSignatureSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { sellerSignatureUrl: validatedData.signatureUrl },
      select: { sellerSignatureUrl: true },
    })

    return NextResponse.json({
      message: "Verkoper handtekening opgeslagen",
      signatureUrl: user.sellerSignatureUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error saving seller signature:", error)
    return NextResponse.json(
      { error: "Fout bij opslaan verkoper handtekening" },
      { status: 500 }
    )
  }
}

