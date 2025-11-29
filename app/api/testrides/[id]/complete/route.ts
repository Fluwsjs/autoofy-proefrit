import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { validateSignatureImage } from "@/lib/file-validation"
import { sendFeedbackEmail } from "@/lib/email"

const completeSchema = z.object({
  completionSignatureUrl: z.string().min(1, "Bedrijfshandtekening is verplicht"),
  customerCompletionSignatureUrl: z.string().min(1, "Klanthandtekening is verplicht"),
  actualEndTime: z.string(),
  actualEndKm: z.number().int().positive("Eindkilometerstand moet positief zijn"),
  completionNotes: z.string().optional(),
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

    // Validate completion signatures
    const sellerSignatureValidation = validateSignatureImage(validatedData.completionSignatureUrl)
    if (!sellerSignatureValidation.valid) {
      return NextResponse.json(
        { error: sellerSignatureValidation.error },
        { status: 400 }
      )
    }
    
    const customerSignatureValidation = validateSignatureImage(validatedData.customerCompletionSignatureUrl)
    if (!customerSignatureValidation.valid) {
      return NextResponse.json(
        { error: customerSignatureValidation.error },
        { status: 400 }
      )
    }

    // Check if testride exists and belongs to tenant
    const testride = await prisma.testride.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        tenant: {
          select: {
            companyName: true,
          }
        }
      }
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
        customerCompletionSignatureUrl: validatedData.customerCompletionSignatureUrl,
        endKm: validatedData.actualEndKm,
        completedAt: new Date(validatedData.actualEndTime),
        notes: validatedData.completionNotes 
          ? `${testride.notes ? testride.notes + '\n\n' : ''}Afrondingsnotities:\n${validatedData.completionNotes}`
          : testride.notes,
      },
    })

    // Send feedback email to customer
    try {
      const companyName = testride.tenant?.companyName || "Uw autobedrijf"
      await sendFeedbackEmail(
        testride.customerEmail,
        testride.customerName,
        companyName,
        testride.carType
      )
      console.log(`✅ Feedback email sent to ${testride.customerEmail}`)
    } catch (emailError) {
      // Log error but don't fail the request - testride is already completed
      console.error("⚠️ Error sending feedback email:", emailError)
    }

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

