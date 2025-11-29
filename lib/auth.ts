import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { authenticator } from "otplib"

export const authOptions: NextAuthOptions = {
  providers: [
    // EmailLink provider for auto-login after email verification
    CredentialsProvider({
      id: "email-link",
      name: "EmailLink",
      credentials: {
        token: { label: "Token", type: "text" },
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.token || !credentials?.userId) {
            return null
          }

          // Find verification token (we'll use this for auto-login)
          const verificationToken = await prisma.verificationToken.findUnique({
            where: { token: credentials.token },
            include: { user: { include: { tenant: true } } },
          })

          // If no verification token, check if user is already verified and use userId
          if (!verificationToken) {
            const user = await prisma.user.findUnique({
              where: { id: credentials.userId },
              include: { tenant: true },
            })

            if (user && user.emailVerified) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                tenantName: user.tenant.name,
                isSuperAdmin: false,
              }
            }
            return null
          }

          // Check if token is expired
          if (verificationToken.expiresAt < new Date()) {
            return null
          }

          // Verify the user
          const user = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
              where: { id: verificationToken.userId },
              data: {
                emailVerified: true,
                emailVerifiedAt: new Date(),
              },
              include: { tenant: true },
            })

            // Delete verification token after use
            await tx.verificationToken.delete({
              where: { id: verificationToken.id },
            })

            return updatedUser
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenantName: user.tenant.name,
            isSuperAdmin: false,
          }
        } catch (error) {
          console.error("EmailLink auth error:", error)
          return null
        }
      },
    }),
    // Regular credentials provider
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        try {
          console.log("[AUTH] Authorize called")
          
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH] Missing credentials")
            throw new Error("Email en wachtwoord zijn verplicht")
          }

          // Normalize email to lowercase (same as registration)
          const normalizedEmail = credentials.email.trim().toLowerCase()
          console.log("[AUTH] Normalized email:", normalizedEmail)

          // First check if it's a super admin
          const superAdmin = await prisma.superAdmin.findUnique({
            where: { email: normalizedEmail },
          })

          if (superAdmin) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              superAdmin.password
            )

            if (!isPasswordValid) {
              throw new Error("Ongeldige inloggegevens")
            }

            return {
              id: superAdmin.id,
              email: superAdmin.email,
              name: superAdmin.name,
              role: "SUPER_ADMIN",
              tenantId: "",
              tenantName: "",
              isSuperAdmin: true,
            }
          }

          // Otherwise check regular user
          console.log(`[AUTH] Looking for user with email: ${normalizedEmail}`)
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { tenant: true }
          })

          if (!user) {
            console.error(`[AUTH] User not found: ${normalizedEmail}`)
            throw new Error("Ongeldige inloggegevens")
          }
          
          console.log(`[AUTH] User found: ${user.email}`)
          
          // Check if user account is active
          if (!user.isActive) {
            console.error(`[AUTH] User account is deactivated: ${user.email}`)
            throw new Error("Uw account is gedeactiveerd. Neem contact op met de beheerder.")
          }

          // Check if email is verified
          if (!user.emailVerified) {
            console.error(`[AUTH] Email not verified for: ${normalizedEmail}`)
            throw new Error("Uw e-mailadres is nog niet geverifieerd. Controleer uw inbox voor de verificatielink.")
          }

          console.log(`[AUTH] Verifying password for: ${normalizedEmail}`)
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log(`[AUTH] Password valid: ${isPasswordValid}`)
          
          if (!isPasswordValid) {
            console.error(`[AUTH] Invalid password for: ${normalizedEmail}`)
            throw new Error("Ongeldige inloggegevens")
          }
          
          console.log(`[AUTH] Login successful for: ${normalizedEmail}`)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenantName: user.tenant.name,
            isSuperAdmin: false,
          }
        } catch (error) {
          console.error("[AUTH] ❌ Auth error occurred:")
          console.error("[AUTH] Credentials provided:", { 
            email: credentials?.email, 
            hasPassword: !!credentials?.password,
            hasCode: !!credentials?.code 
          })
          if (error instanceof Error) {
            console.error("[AUTH] Error message:", error.message)
            console.error("[AUTH] Error stack:", error.stack)
          } else {
            console.error("[AUTH] Unknown error:", error)
          }
          // Always return null on error - NextAuth will handle the error response
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId || ""
        token.tenantName = (user as any).tenantName || ""
        token.isSuperAdmin = (user as any).isSuperAdmin || false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).tenantId = token.tenantId as string
        ;(session.user as any).tenantName = token.tenantName as string
        ;(session.user as any).isSuperAdmin = token.isSuperAdmin as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Let NextAuth auto-detect domain from NEXTAUTH_URL
        // This ensures cookies work correctly on your actual domain
      },
    },
  },
  // Add debug logging in production to help troubleshoot
  debug: process.env.NODE_ENV === "production",
}
