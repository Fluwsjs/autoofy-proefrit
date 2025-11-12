import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isSuperAdmin) {
    redirect("/")
  }

  return session
}

