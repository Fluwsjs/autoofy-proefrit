import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    )
  }

  try {
    // Test database connection
    await prisma.$connect()
    
    // Try to count tenants to verify schema exists
    const tenantCount = await prisma.tenant.count()
    const userCount = await prisma.user.count()
    const testrideCount = await prisma.testride.count()
    const superAdminCount = await prisma.superAdmin.count()
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully!",
      counts: {
        tenants: tenantCount,
        users: userCount,
        testrides: testrideCount,
        superAdmins: superAdminCount
      },
      databaseUrl: process.env.DATABASE_URL ? "Set (hidden)" : "NOT SET"
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      hint: "Check DATABASE_URL in Netlify environment variables"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

