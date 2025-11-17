import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    // EmailLink provider for auto-login after email verification
    CredentialsProvider({
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
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email en wachtwoord zijn verplicht")
          }

          // Normalize email to lowercase (same as registration)
          const normalizedEmail = credentials.email.trim().toLowerCase()

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
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { tenant: true }
          })

          if (!user) {
            throw new Error("Ongeldige inloggegevens")
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("E-mailadres is nog niet geverifieerd. Controleer uw inbox voor de verificatie e-mail.")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Ongeldige inloggegevens")
          }

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
          console.error("Auth error:", error)
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
    }
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

