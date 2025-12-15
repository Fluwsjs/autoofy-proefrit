import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Haal alle feedback op voor de ingelogde tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Get all feedback for testrides belonging to this tenant
    const feedbacks = await prisma.feedback.findMany({
      where: {
        testride: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        testride: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            carType: true,
            date: true,
            seller: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate stats
    const totalFeedbacks = feedbacks.length
    
    // Count purchase likelihood
    const purchaseLikelihood: Record<string, number> = {}
    feedbacks.forEach(f => {
      purchaseLikelihood[f.purchaseLikelihood] = (purchaseLikelihood[f.purchaseLikelihood] || 0) + 1
    })

    // Count seller contact ratings
    const sellerContact: Record<string, number> = {}
    feedbacks.forEach(f => {
      sellerContact[f.sellerContact] = (sellerContact[f.sellerContact] || 0) + 1
    })

    // Count how found us
    const howFoundUs: Record<string, number> = {}
    feedbacks.forEach(f => {
      howFoundUs[f.howFoundUs] = (howFoundUs[f.howFoundUs] || 0) + 1
    })

    return NextResponse.json({
      feedbacks,
      stats: {
        total: totalFeedbacks,
        purchaseLikelihood,
        sellerContact,
        howFoundUs,
      },
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen feedback" },
      { status: 500 }
    )
  }
}
