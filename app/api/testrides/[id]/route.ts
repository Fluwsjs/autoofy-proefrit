import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const testride = await prisma.testride.findFirst({
      where: {
        id: id,
        tenantId: session.user.tenantId,
      },
    })

    if (!testride) {
      return NextResponse.json(
        { error: "Proefrit niet gevonden" },
        { status: 404 }
      )
    }

    return NextResponse.json(testride)
  } catch (error) {
    console.error("Error fetching testride:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen proefrit" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    // Check if testride exists and belongs to tenant
    const testride = await prisma.testride.findFirst({
      where: {
        id: id,
        tenantId: session.user.tenantId,
      },
    })

    if (!testride) {
      return NextResponse.json(
        { error: "Proefrit niet gevonden" },
        { status: 404 }
      )
    }

    await prisma.testride.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: "Proefrit verwijderd" })
  } catch (error) {
    console.error("Error deleting testride:", error)
    return NextResponse.json(
      { error: "Fout bij verwijderen proefrit" },
      { status: 500 }
    )
  }
}

