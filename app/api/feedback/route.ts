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

    // Calculate average ratings
    const totalFeedbacks = feedbacks.length
    const averages = totalFeedbacks > 0 ? {
      overall: feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / totalFeedbacks,
      service: feedbacks.reduce((sum, f) => sum + f.serviceRating, 0) / totalFeedbacks,
      vehicle: feedbacks.reduce((sum, f) => sum + f.vehicleRating, 0) / totalFeedbacks,
      info: feedbacks.reduce((sum, f) => sum + f.infoRating, 0) / totalFeedbacks,
      recommendRate: feedbacks.filter(f => f.wouldRecommend).length / totalFeedbacks * 100,
    } : null

    return NextResponse.json({
      feedbacks,
      stats: {
        total: totalFeedbacks,
        averages,
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

