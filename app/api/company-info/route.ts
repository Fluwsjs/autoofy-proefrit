import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sanitizeString } from "@/lib/sanitize"

const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Bedrijfsnaam is verplicht"),
  companyAddress: z.string().min(1, "Adres is verplicht"),
  companyZipCode: z.string().min(1, "Postcode is verplicht"),
  companyCity: z.string().min(1, "Plaats is verplicht"),
  companyPhone: z.string().min(1, "Telefoonnummer is verplicht"),
  companyKvK: z.string().optional(),
  companyVAT: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        companyName: true,
        companyAddress: true,
        companyZipCode: true,
        companyCity: true,
        companyPhone: true,
        companyKvK: true,
        companyVAT: true,
      },
    })

    if (!tenant) {
      return NextResponse.json(
        { error: "Bedrijf niet gevonden" },
        { status: 404 }
      )
    }

    // Return tenant data with null values converted to empty strings for frontend
    return NextResponse.json({
      companyName: tenant.companyName || null,
      companyAddress: tenant.companyAddress || null,
      companyZipCode: tenant.companyZipCode || null,
      companyCity: tenant.companyCity || null,
      companyPhone: tenant.companyPhone || null,
      companyKvK: tenant.companyKvK || null,
      companyVAT: tenant.companyVAT || null,
    })
  } catch (error) {
    console.error("Error fetching company info:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen bedrijfsgegevens" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Sanitize inputs
    const sanitizedBody = {
      companyName: sanitizeString(body.companyName || ""),
      companyAddress: sanitizeString(body.companyAddress || ""),
      companyZipCode: sanitizeString(body.companyZipCode || ""),
      companyCity: sanitizeString(body.companyCity || ""),
      companyPhone: sanitizeString(body.companyPhone || ""),
      companyKvK: body.companyKvK ? sanitizeString(body.companyKvK) : undefined,
      companyVAT: body.companyVAT ? sanitizeString(body.companyVAT) : undefined,
    }

    const validatedData = companyInfoSchema.parse(sanitizedBody)

    const updatedTenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: validatedData,
    })

    return NextResponse.json(updatedTenant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating company info:", error)
    return NextResponse.json(
      { error: "Fout bij opslaan bedrijfsgegevens" },
      { status: 500 }
    )
  }
}

