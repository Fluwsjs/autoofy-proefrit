import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

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

    // Verify the user's email
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      })

      // Delete verification token
      await tx.verificationToken.delete({
        where: { id: verificationToken.id },
      })
    })

    return NextResponse.redirect(
      new URL("/auth/verify-email?success=true", request.url)
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=server_error", request.url)
    )
  }
}

