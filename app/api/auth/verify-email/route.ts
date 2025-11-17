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
    // Use transaction to ensure verification is saved even if auto-login fails
    const user = await prisma.$transaction(async (tx) => {
      // Update user email verification status
      const updatedUser = await tx.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        include: { tenant: true },
      })

      // Keep the token for auto-login (don't delete it yet)
      // We'll delete it during the login process in the EmailLink provider
      
      return updatedUser
    })

    // Log successful verification
    console.log(`✅ Email verified for user: ${user.email} (ID: ${user.id})`)

    // Redirect to auto-login page that will use the EmailLink provider
    const baseUrl = new URL(request.url)
    const redirectUrl = new URL("/auth/auto-login", baseUrl.origin)
    redirectUrl.searchParams.set("token", verificationToken.token)
    redirectUrl.searchParams.set("userId", user.id)
    redirectUrl.searchParams.set("callbackUrl", `${baseUrl.origin}/dashboard`)

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Email verification error:", error)
    console.error("Error details:", error instanceof Error ? error.stack : error)
    
    // Even if there's an error, try to verify the user if we have a token
    // This ensures the user can still login manually
    try {
      const searchParams = request.nextUrl.searchParams
      const token = searchParams.get("token")
      
      if (token) {
        const verificationToken = await prisma.verificationToken.findUnique({
          where: { token },
          include: { user: true },
        })
        
        if (verificationToken && !verificationToken.user.emailVerified) {
          // Try to verify the user anyway
          await prisma.user.update({
            where: { id: verificationToken.userId },
            data: {
              emailVerified: true,
              emailVerifiedAt: new Date(),
            },
          })
          console.log(`✅ Email verified as fallback for user: ${verificationToken.user.email}`)
          
          // Redirect to login page with success message
          const baseUrl = new URL(request.url)
          return NextResponse.redirect(
            new URL(`/?verified=true&email=${encodeURIComponent(verificationToken.user.email)}`, baseUrl.origin)
          )
        }
      }
    } catch (fallbackError) {
      console.error("Fallback verification error:", fallbackError)
    }
    
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=server_error", request.url)
    )
  }
}

