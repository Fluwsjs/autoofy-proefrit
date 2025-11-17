import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Add debug logging for production
if (process.env.NODE_ENV === "production") {
  console.log("[NEXTAUTH] Initializing NextAuth...")
  console.log("[NEXTAUTH] NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
  console.log("[NEXTAUTH] NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "NOT SET")
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

