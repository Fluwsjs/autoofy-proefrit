import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin()

    // Get all tenants with their stats
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            testrides: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        testrides: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Latest 5 testrides
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate totals
    const totalTenants = await prisma.tenant.count()
    const totalUsers = await prisma.user.count()
    const totalTestrides = await prisma.testride.count()

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTenants = await prisma.tenant.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const recentTestrides = await prisma.testride.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Testrides per month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const testridesByMonth = await prisma.testride.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    })

    // Group by month
    const monthlyStats = testridesByMonth.reduce((acc, item) => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      overview: {
        totalTenants,
        totalUsers,
        totalTestrides,
        recentTenants,
        recentTestrides,
      },
      tenants: tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        createdAt: tenant.createdAt,
        userCount: tenant._count.users,
        testrideCount: tenant._count.testrides,
        users: tenant.users,
        latestTestrides: tenant.testrides,
      })),
      monthlyStats,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen statistieken" },
      { status: 500 }
    )
  }
}

