import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE: Verwijder handelaarskenteken
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Check if dealer plate exists and belongs to user
    const dealerPlate = await prisma.dealerPlate.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!dealerPlate) {
      return NextResponse.json(
        { error: "Handelaarskenteken niet gevonden" },
        { status: 404 }
      )
    }

    await prisma.dealerPlate.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: "Handelaarskenteken verwijderd" })
  } catch (error) {
    console.error("Error deleting dealer plate:", error)
    return NextResponse.json(
      { error: "Fout bij verwijderen handelaarskenteken" },
      { status: 500 }
    )
  }
}

