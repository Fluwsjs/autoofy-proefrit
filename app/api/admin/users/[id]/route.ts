import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Verwijder gebruiker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Gebruiker succesvol verwijderd",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Fout bij verwijderen gebruiker" },
      { status: 500 }
    )
  }
}

// PATCH - Update gebruiker (activeren/deactiveren)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive moet een boolean zijn" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 }
      )
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: `Gebruiker ${isActive ? "geactiveerd" : "gedeactiveerd"}`,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Fout bij bijwerken gebruiker" },
      { status: 500 }
    )
  }
}

