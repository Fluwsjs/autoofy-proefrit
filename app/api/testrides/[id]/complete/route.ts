import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { validateSignatureImage } from "@/lib/file-validation"

const completeSchema = z.object({
  completionSignatureUrl: z.string().min(1, "Handtekening is verplicht"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = completeSchema.parse(body)

    // Validate completion signature
    const signatureValidation = validateSignatureImage(validatedData.completionSignatureUrl)
    if (!signatureValidation.valid) {
      return NextResponse.json(
        { error: signatureValidation.error },
        { status: 400 }
      )
    }

    // Check if testride exists and belongs to tenant
    const testride = await prisma.testride.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!testride) {
      return NextResponse.json(
        { error: "Proefrit niet gevonden" },
        { status: 404 }
      )
    }

    if (testride.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Deze proefrit is al afgerond" },
        { status: 400 }
      )
    }

    // Update testride to completed
    const updatedTestride = await prisma.testride.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completionSignatureUrl: validatedData.completionSignatureUrl,
        completedAt: new Date(),
      },
    })

    return NextResponse.json(updatedTestride)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error completing testride:", error)
    return NextResponse.json(
      { error: "Fout bij afronden proefrit" },
      { status: 500 }
    )
  }
}

