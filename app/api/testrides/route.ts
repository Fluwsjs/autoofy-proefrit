import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { validateBase64Images, validateSignatureImage } from "@/lib/file-validation"
import {
  parsePaginationParams,
  calculatePagination,
  createPaginatedResponse,
} from "@/lib/pagination"
import { sanitizeString, sanitizeEmail, sanitizeText } from "@/lib/sanitize"

const testrideSchema = z.object({
  customerName: z.string().min(1, "Klantnaam is verplicht"),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  customerPhone: z.string().optional(),
  address: z.string().min(1, "Adres is verplicht"),
  startTime: z.string(),
  endTime: z.string(),
  date: z.string(),
  carType: z.string().min(1, "Testrit voertuig is verplicht"),
  licensePlate: z.string().optional(),
  driverLicenseNumber: z.string().optional(),
  idCountryOfOrigin: z.string().optional(),
  dealerPlateId: z.string().optional(),
  sellerId: z.string().optional(),
  dealerPlateCardGiven: z.boolean().optional(),
  idPhotoFrontUrl: z.string().optional(),
  idPhotoBackUrl: z.string().optional(),
  damagePhotos: z.array(z.string()).optional(),
  customerSignatureUrl: z.string().optional(),
  sellerSignatureUrl: z.string().optional(),
  eigenRisico: z.number().int().min(0).max(1000, "Eigen risico moet tussen 0 en 1000 zijn"),
  aantalSleutels: z.number().int().min(1).max(4, "Aantal sleutels moet tussen 1 en 4 zijn"),
  startKm: z.number().int().positive("Startkilometerstand moet positief zijn"),
  endKm: z.number().int().positive().optional(),
  notes: z.string().optional(),
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

    // Parse pagination parameters
    const { page, limit } = parsePaginationParams(request)
    const skip = (page - 1) * limit

    // Get total count for pagination metadata
    const total = await prisma.testride.count({
      where: {
        tenantId: session.user.tenantId,
      },
    })

    // Fetch paginated testrides
    const testrides = await prisma.testride.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      include: {
        dealerPlate: true,
        seller: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Calculate pagination metadata
    const pagination = calculatePagination(page, limit, total)

    // Return paginated response
    return NextResponse.json(createPaginatedResponse(testrides, pagination))
  } catch (error) {
    console.error("Error fetching testrides:", error)
    return NextResponse.json(
      { error: "Fout bij ophalen proefritten" },
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
    
    // Sanitize text inputs
    const sanitizedBody = {
      ...body,
      customerName: sanitizeString(body.customerName || ""),
      customerEmail: sanitizeEmail(body.customerEmail || ""),
      customerPhone: body.customerPhone ? sanitizeString(body.customerPhone) : undefined,
      address: sanitizeString(body.address || ""),
      carType: sanitizeString(body.carType || ""),
      licensePlate: body.licensePlate ? sanitizeString(body.licensePlate) : undefined,
      driverLicenseNumber: body.driverLicenseNumber ? sanitizeString(body.driverLicenseNumber) : undefined,
      idCountryOfOrigin: body.idCountryOfOrigin ? sanitizeString(body.idCountryOfOrigin) : undefined,
      notes: body.notes ? sanitizeText(body.notes) : undefined,
    }
    
    const validatedData = testrideSchema.parse(sanitizedBody)

    // Validate file uploads (images and signatures)
    const imageFiles = [
      validatedData.idPhotoFrontUrl,
      validatedData.idPhotoBackUrl,
    ].filter(Boolean) as string[]

    if (imageFiles.length > 0) {
      const imageValidation = validateBase64Images(imageFiles)
      if (!imageValidation.valid) {
        return NextResponse.json(
          { error: imageValidation.error },
          { status: 400 }
        )
      }
    }

    // Validate customer signature
    if (validatedData.customerSignatureUrl) {
      const signatureValidation = validateSignatureImage(validatedData.customerSignatureUrl)
      if (!signatureValidation.valid) {
        return NextResponse.json(
          { error: signatureValidation.error },
          { status: 400 }
        )
      }
    }

    // Validate seller signature
    if (validatedData.sellerSignatureUrl) {
      const signatureValidation = validateSignatureImage(validatedData.sellerSignatureUrl)
      if (!signatureValidation.valid) {
        return NextResponse.json(
          { error: signatureValidation.error },
          { status: 400 }
        )
      }
    }

    const testride = await prisma.testride.create({
      data: {
        ...validatedData,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        date: new Date(validatedData.date),
        tenantId: session.user.tenantId,
      },
    })

    return NextResponse.json(testride, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating testride:", error)
    return NextResponse.json(
      { error: "Fout bij aanmaken proefrit" },
      { status: 500 }
    )
  }
}

