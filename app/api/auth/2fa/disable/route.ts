import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Disable 2FA
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null 
      }
    })

    return NextResponse.json({ message: "2FA disabled successfully" })
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

