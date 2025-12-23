import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { 
  getBlockedEntries, 
  unblockIp, 
  unblockEmail, 
  clearAllRateLimits 
} from "@/lib/rate-limit"

// GET - Haal alle geblokkeerde entries op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const entries = getBlockedEntries()
    
    return NextResponse.json({
      success: true,
      count: entries.length,
      entries: entries,
    })
  } catch (error) {
    console.error("Error fetching rate limit entries:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen rate limit data" },
      { status: 500 }
    )
  }
}

// POST - Deblokkeer een IP of email
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ip, email } = body

    if (!ip && !email) {
      return NextResponse.json(
        { error: "Geef een IP-adres of email op" },
        { status: 400 }
      )
    }

    let unblocked = false
    let message = ""

    if (ip) {
      unblocked = unblockIp(ip)
      message = unblocked 
        ? `IP ${ip} is gedeblokkeerd` 
        : `IP ${ip} was niet geblokkeerd`
    }

    if (email) {
      const emailUnblocked = unblockEmail(email)
      if (emailUnblocked) {
        unblocked = true
        message += message ? ` en email ${email} is gedeblokkeerd` : `Email ${email} is gedeblokkeerd`
      } else {
        message += message ? ` (email ${email} was niet geblokkeerd)` : `Email ${email} was niet geblokkeerd`
      }
    }

    return NextResponse.json({
      success: true,
      unblocked,
      message,
    })
  } catch (error) {
    console.error("Error unblocking:", error)
    return NextResponse.json(
      { error: "Fout bij deblokkeren" },
      { status: 500 }
    )
  }
}

// DELETE - Wis alle rate limits (gebruik met voorzichtigheid!)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isSuperAdmin) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const count = clearAllRateLimits()

    return NextResponse.json({
      success: true,
      message: `${count} rate limit entries gewist`,
      clearedCount: count,
    })
  } catch (error) {
    console.error("Error clearing rate limits:", error)
    return NextResponse.json(
      { error: "Fout bij wissen rate limits" },
      { status: 500 }
    )
  }
}

