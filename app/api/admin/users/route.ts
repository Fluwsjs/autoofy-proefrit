import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  parsePaginationParams,
  calculatePagination,
  createPaginatedResponse,
} from "@/lib/pagination"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 })
    }

    // Parse pagination parameters
    const { page, limit } = parsePaginationParams(request)
    const skip = (page - 1) * limit

    // Get total count for pagination metadata
    const total = await prisma.user.count()

    // Fetch paginated users
    const users = await prisma.user.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total)

    // Return paginated response
    return NextResponse.json(createPaginatedResponse(users, pagination))
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen gebruikers" },
      { status: 500 }
    )
  }
}

