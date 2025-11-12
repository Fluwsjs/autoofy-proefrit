import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This endpoint should be called by a cron job (e.g., Vercel Cron, Supabase Edge Function)
// to delete testrides older than 6 months
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if needed
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const result = await prisma.testride.deleteMany({
      where: {
        createdAt: {
          lt: sixMonthsAgo,
        },
      },
    })

    return NextResponse.json({
      message: `Verwijderd ${result.count} proefritten ouder dan 6 maanden`,
      deleted: result.count,
    })
  } catch (error) {
    console.error("Error cleaning up testrides:", error)
    return NextResponse.json(
      { error: "Fout bij opschonen proefritten" },
      { status: 500 }
    )
  }
}

