import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailVerificationRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (based on token, which we'll extract first)
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    
    // Apply rate limiting before processing
    // Note: This limits by IP, but ideally would limit by email from token
    const rateLimitResult = await emailVerificationRateLimit(request)
    if (rateLimitResult && !token) {
      // If no token and rate limited, return error
      return rateLimitResult
    }

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid_token", request.url)
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid_token", request.url)
      )
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=expired_token", request.url)
      )
    }

    // Verify the user's email and get user info
    const user = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        include: { tenant: true },
      })

      // Delete verification token
      await tx.verificationToken.delete({
        where: { id: verificationToken.id },
      })

      return updatedUser
    })

    // Create a session token that can be used to auto-login
    // Store it in a cookie that will be used by the client to auto-login
    const baseUrl = new URL(request.url)
    const redirectUrl = new URL("/auth/verify-email", baseUrl.origin)
    redirectUrl.searchParams.set("success", "true")
    redirectUrl.searchParams.set("email", user.email)
    
    // Set a temporary cookie with user email for auto-login
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("verification_email", user.email, {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
    })

    return response
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=server_error", request.url)
    )
  }
}

