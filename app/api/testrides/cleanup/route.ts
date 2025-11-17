import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This endpoint should be called by a cron job (e.g., Netlify Cron, Vercel Cron)
// to delete testrides older than 6 months and expired tokens
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if needed
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Cleanup testrides older than 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const testridesResult = await prisma.testride.deleteMany({
      where: {
        createdAt: {
          lt: sixMonthsAgo,
        },
      },
    })

    // Cleanup expired verification tokens
    const verificationTokensResult = await prisma.verificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })

    // Cleanup expired password reset tokens
    const passwordResetTokensResult = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })

    return NextResponse.json({
      message: "Cleanup succesvol uitgevoerd",
      deleted: {
        testrides: testridesResult.count,
        verificationTokens: verificationTokensResult.count,
        passwordResetTokens: passwordResetTokensResult.count,
      },
    })
  } catch (error) {
    console.error("Error during cleanup:", error)
    return NextResponse.json(
      { error: "Fout bij opschonen" },
      { status: 500 }
    )
  }
}

