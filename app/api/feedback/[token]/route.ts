import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema voor feedback validatie
const feedbackSchema = z.object({
  overallRating: z.number().min(1).max(5),
  serviceRating: z.number().min(1).max(5),
  vehicleRating: z.number().min(1).max(5),
  infoRating: z.number().min(1).max(5),
  bestPart: z.string().max(1000).optional(),
  improvements: z.string().max(1000).optional(),
  wouldRecommend: z.boolean(),
  additionalComments: z.string().max(2000).optional(),
})

// GET - Haal proefrit info op voor feedback formulier (publiek, geen auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Zoek de feedback token
    const feedbackToken = await prisma.feedbackToken.findUnique({
      where: { token },
    })

    if (!feedbackToken) {
      return NextResponse.json(
        { error: "Ongeldige link" },
        { status: 404 }
      )
    }

    // Check of token is verlopen
    if (new Date() > feedbackToken.expiresAt) {
      return NextResponse.json(
        { error: "Deze link is verlopen" },
        { status: 410 }
      )
    }

    // Check of al feedback is gegeven
    if (feedbackToken.usedAt) {
      return NextResponse.json(
        { error: "U heeft al feedback gegeven voor deze proefrit" },
        { status: 409 }
      )
    }

    // Haal proefrit info op
    const testride = await prisma.testride.findUnique({
      where: { id: feedbackToken.testrideId },
      select: {
        id: true,
        customerName: true,
        carType: true,
        date: true,
        seller: {
          select: {
            name: true,
          },
        },
        tenant: {
          select: {
            companyName: true,
            companyLogo: true,
          },
        },
      },
    })

    if (!testride) {
      return NextResponse.json(
        { error: "Proefrit niet gevonden" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      testride: {
        customerName: testride.customerName,
        carType: testride.carType,
        date: testride.date,
        sellerName: testride.seller?.name || null,
        companyName: testride.tenant?.companyName || "Het autobedrijf",
        companyLogo: testride.tenant?.companyLogo || null,
      },
    })
  } catch (error) {
    console.error("Error fetching feedback info:", error)
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

// POST - Submit feedback (publiek, geen auth)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Zoek de feedback token
    const feedbackToken = await prisma.feedbackToken.findUnique({
      where: { token },
    })

    if (!feedbackToken) {
      return NextResponse.json(
        { error: "Ongeldige link" },
        { status: 404 }
      )
    }

    // Check of token is verlopen
    if (new Date() > feedbackToken.expiresAt) {
      return NextResponse.json(
        { error: "Deze link is verlopen" },
        { status: 410 }
      )
    }

    // Check of al feedback is gegeven
    if (feedbackToken.usedAt) {
      return NextResponse.json(
        { error: "U heeft al feedback gegeven voor deze proefrit" },
        { status: 409 }
      )
    }

    // Valideer input
    const validatedData = feedbackSchema.parse(body)

    // Check of er al feedback bestaat voor deze proefrit
    const existingFeedback = await prisma.feedback.findUnique({
      where: { testrideId: feedbackToken.testrideId },
    })

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Er is al feedback gegeven voor deze proefrit" },
        { status: 409 }
      )
    }

    // Maak feedback aan en markeer token als gebruikt
    const feedback = await prisma.$transaction(async (tx) => {
      // Maak feedback aan
      const newFeedback = await tx.feedback.create({
        data: {
          testrideId: feedbackToken.testrideId,
          overallRating: validatedData.overallRating,
          serviceRating: validatedData.serviceRating,
          vehicleRating: validatedData.vehicleRating,
          infoRating: validatedData.infoRating,
          bestPart: validatedData.bestPart || null,
          improvements: validatedData.improvements || null,
          wouldRecommend: validatedData.wouldRecommend,
          additionalComments: validatedData.additionalComments || null,
        },
      })

      // Markeer token als gebruikt
      await tx.feedbackToken.update({
        where: { id: feedbackToken.id },
        data: { usedAt: new Date() },
      })

      return newFeedback
    })

    return NextResponse.json({
      success: true,
      message: "Bedankt voor uw feedback!",
      feedbackId: feedback.id,
    })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ongeldige gegevens", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    )
  }
}

