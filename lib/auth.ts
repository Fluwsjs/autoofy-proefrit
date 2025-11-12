import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
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

          // First check if it's a super admin
          const superAdmin = await prisma.superAdmin.findUnique({
            where: { email: credentials.email },
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
            where: { email: credentials.email },
            include: { tenant: true }
          })

          if (!user) {
            throw new Error("Ongeldige inloggegevens")
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

