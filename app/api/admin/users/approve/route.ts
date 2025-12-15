import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { sendApprovalEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is Super Admin
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any).isSuperAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has verified their email first
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Gebruiker moet eerst hun e-mail verifiëren voordat ze goedgekeurd kunnen worden" },
        { status: 400 }
      )
    }

    // Check if already approved
    if (user.isApproved) {
      return NextResponse.json(
        { error: "Gebruiker is al goedgekeurd" },
        { status: 400 }
      )
    }

    // Update user approval status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isApproved: true,
        approvedAt: new Date(),
      },
    })

    // Send approval email to user
    try {
      await sendApprovalEmail(user.email, user.name)
      console.log(`✅ Approval email sent to ${user.email}`)
    } catch (emailError) {
      console.error(`❌ Failed to send approval email to ${user.email}:`, emailError)
      // Don't fail the approval if email fails - user is still approved
    }

    return NextResponse.json({ 
      message: "Gebruiker succesvol goedgekeurd",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isApproved: updatedUser.isApproved,
      }
    })
  } catch (error) {
    console.error("Error approving user:", error)
    return NextResponse.json(
      { error: "Fout bij goedkeuren gebruiker" },
      { status: 500 }
    )
  }
}

