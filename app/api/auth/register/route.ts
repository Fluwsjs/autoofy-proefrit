import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { registerRateLimit, getRateLimitHeaders } from "@/lib/rate-limit"
import { validatePasswordStrength } from "@/lib/password-validation"
import { sanitizeString, sanitizeEmail } from "@/lib/sanitize"
import { generateVerificationToken, getVerificationTokenExpiry } from "@/lib/auth-utils"
import { sendVerificationEmail, sendNewUserNotificationEmail } from "@/lib/email"

const registerSchema = z.object({
  tenantName: z.string().min(1, "Bedrijfsnaam is verplicht").trim(),
  userName: z.string().min(1, "Uw naam is verplicht").trim(),
  email: z.string().email("Ongeldig e-mailadres").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens lang zijn")
    .regex(/[a-z]/, "Wachtwoord moet minimaal één kleine letter bevatten")
    .regex(/[A-Z]/, "Wachtwoord moet minimaal één hoofdletter bevatten")
    .regex(/\d/, "Wachtwoord moet minimaal één cijfer bevatten")
    .regex(/[^a-zA-Z\d]/, "Wachtwoord moet minimaal één speciaal teken bevatten"),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await registerRateLimit(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()
    
    // Sanitize input
    const sanitizedBody = {
      ...body,
      tenantName: sanitizeString(body.tenantName || ""),
      userName: sanitizeString(body.userName || ""),
      email: sanitizeEmail(body.email || ""),
    }
    
    const validatedData = registerSchema.parse(sanitizedBody)

    // Additional password strength validation
    const passwordValidation = validatePasswordStrength(validatedData.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] || "Wachtwoord is niet sterk genoeg" },
        { status: 400 }
      )
    }

    // Check if email already exists (as tenant or user)
    const existingTenant = await prisma.tenant.findUnique({
      where: { email: validatedData.email },
    })

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingTenant || existingUser) {
      return NextResponse.json(
        { error: "E-mailadres is al in gebruik" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Generate email verification token
    const verificationToken = generateVerificationToken()
    const tokenExpiresAt = getVerificationTokenExpiry()

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.tenantName,
          email: validatedData.email,
        },
      })

      const user = await tx.user.create({
        data: {
          name: validatedData.userName,
          email: validatedData.email,
          password: hashedPassword,
          role: "DEALER", // Dealer rol voor nieuwe registraties
          tenantId: tenant.id,
          emailVerified: false, // Requires email verification
          emailVerifiedAt: null,
        },
      })

      // Create verification token
      await tx.verificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt: tokenExpiresAt,
        },
      })

      return { tenant, user }
    })

    // Send verification email (AWAIT in serverless - must complete before response)
    console.log(`🔍 [REGISTER] Attempting to send verification email to: ${validatedData.email}`)
    
    try {
      const emailResult = await sendVerificationEmail(
        validatedData.email,
        verificationToken,
        validatedData.userName
      )
      
      if (emailResult.success) {
        console.log(`✅ [REGISTER] Verification email sent successfully to: ${validatedData.email}`)
        // Resend returns {id}, SMTP returns {messageId}
        const emailId = (emailResult.data as any)?.id || (emailResult.data as any)?.messageId || 'N/A'
        console.log(`   Email ID: ${emailId}`)
      } else {
        console.error(`❌ [REGISTER] Failed to send verification email to: ${validatedData.email}`)
        console.error(`   Error: ${emailResult.error}`)
        // Don't fail registration if email fails - user can resend later
      }
    } catch (emailError) {
      console.error(`❌ [REGISTER] Exception sending verification email to: ${validatedData.email}`)
      console.error("   Error details:", emailError)
      // Don't fail registration if email fails - user can resend later
    }

    // Send notification to admin about new user registration
    try {
      const adminEmail = "support@proefrit-autoofy.nl"
      console.log(`📧 [REGISTER] Sending admin notification to: ${adminEmail}`)
      
      await sendNewUserNotificationEmail(
        adminEmail,
        validatedData.userName,
        validatedData.email,
        validatedData.tenantName
      )
      
      console.log(`✅ [REGISTER] Admin notification sent successfully`)
    } catch (adminEmailError) {
      console.error(`❌ [REGISTER] Failed to send admin notification:`, adminEmailError)
      // Don't fail registration if admin email fails
    }

    // Get rate limit headers
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwarded?.split(",")[0] || realIp || "unknown"
    const rateLimitHeaders = getRateLimitHeaders(
      `rate-limit:${ip}`,
      { maxRequests: 3, windowMs: 60 * 60 * 1000 }
    )

    return NextResponse.json(
      {
        message: "Account succesvol aangemaakt. Controleer uw e-mail om uw account te activeren.",
        tenantId: result.tenant.id,
        email: validatedData.email,
        requiresVerification: true,
      },
      { 
        status: 201,
        headers: rateLimitHeaders,
      }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      // Check for Prisma schema errors
      if (error.message.includes("Can't reach database server") || 
          error.message.includes("P1001") ||
          error.message.includes("connection")) {
        return NextResponse.json(
          { error: "Database connectie fout. Check DATABASE_URL." },
          { status: 500 }
        )
      }
      
      // Check for missing table/model errors
      if (error.message.includes("does not exist") ||
          error.message.includes("P2021") ||
          error.message.includes("Unknown model") ||
          error.message.includes("table") && error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Database schema niet up-to-date. Voer 'npx prisma db push' uit." },
          { status: 500 }
        )
      }
      
      // Return more specific error message
      return NextResponse.json(
        { error: error.message || "Er is een fout opgetreden bij het aanmaken van het account" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van het account" },
      { status: 500 }
    )
  }
}
