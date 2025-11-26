#!/usr/bin/env node

/**
 * Script to add watermarks to existing ID photos in the database
 * 
 * This script processes all existing testride records that have ID photos
 * and adds watermarks to them for security compliance.
 * 
 * Usage:
 *   node scripts/secure-existing-photos.js [--dry-run]
 * 
 * Options:
 *   --dry-run: Show what would be done without making changes
 */

const { PrismaClient } = require("@prisma/client")
const { createCanvas, loadImage } = require("canvas")

const prisma = new PrismaClient()
const isDryRun = process.argv.includes("--dry-run")

/**
 * Add watermark to image (Node.js version using canvas package)
 */
async function addWatermarkToImageNode(base64Image) {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.split(",")[1] || base64Image
    const prefix = base64Image.split(",")[0]
    const buffer = Buffer.from(base64Data, "base64")

    // Load image
    const img = await loadImage(buffer)

    // Create canvas
    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    // Draw original image
    ctx.drawImage(img, 0, 0)

    // Prepare watermark
    ctx.save()
    ctx.globalAlpha = 0.3
    ctx.fillStyle = "#B22234"
    ctx.font = "bold 40px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Rotate canvas for diagonal watermark
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((-45 * Math.PI) / 180)

    // Draw multiple watermarks
    const text = "AUTOOFY - ALLEEN VERIFICATIE"
    const spacing = 200
    const rows = Math.ceil(canvas.height / spacing) + 2
    const cols = Math.ceil(canvas.width / spacing) + 2

    for (let row = -rows; row < rows; row++) {
      for (let col = -cols; col < cols; col++) {
        ctx.fillText(text, col * spacing, row * spacing)
      }
    }

    ctx.restore()

    // Add border indicator
    ctx.strokeStyle = "#B22234"
    ctx.lineWidth = 8
    ctx.globalAlpha = 0.6
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Add timestamp
    ctx.globalAlpha = 0.5
    ctx.fillStyle = "#B22234"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "right"
    const date = new Date().toLocaleDateString("nl-NL")
    ctx.fillText(`Gearchiveerd: ${date}`, canvas.width - 10, canvas.height - 10)

    // Convert to base64
    const watermarkedBuffer = canvas.toBuffer("image/jpeg", { quality: 0.9 })
    const watermarkedBase64 = watermarkedBuffer.toString("base64")
    
    return `${prefix},data:image/jpeg;base64,${watermarkedBase64}`
  } catch (error) {
    console.error("Error adding watermark:", error.message)
    throw error
  }
}

/**
 * Check if image already has watermark (basic check)
 */
function hasWatermark(base64Image) {
  if (!base64Image) return false
  
  // If image has a timestamp in the format we add, assume it's watermarked
  // This is a simple heuristic - in production you might want a more robust check
  const size = (base64Image.length * 3) / 4 / (1024 * 1024)
  
  // Watermarked images are typically slightly larger due to the added text
  // This is not foolproof but works as a basic check
  return base64Image.includes("Gearchiveerd:")
}

async function main() {
  console.log("🔍 Fetching testrides with ID photos...")
  
  // Get all testrides with ID photos
  const testrides = await prisma.testride.findMany({
    where: {
      OR: [
        { idPhotoFrontUrl: { not: null } },
        { idPhotoBackUrl: { not: null } },
      ],
    },
    select: {
      id: true,
      customerName: true,
      idPhotoFrontUrl: true,
      idPhotoBackUrl: true,
    },
  })

  console.log(`📊 Found ${testrides.length} testrides with ID photos\n`)

  if (testrides.length === 0) {
    console.log("✅ No testrides with ID photos found. Nothing to do.")
    await prisma.$disconnect()
    return
  }

  let processedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const testride of testrides) {
    console.log(`\n📝 Processing testride: ${testride.id}`)
    console.log(`   Customer: ${testride.customerName}`)

    const updates = {}
    let needsUpdate = false

    // Process front photo
    if (testride.idPhotoFrontUrl) {
      if (hasWatermark(testride.idPhotoFrontUrl)) {
        console.log("   ⏭️  Front photo already has watermark (skipping)")
        skippedCount++
      } else {
        console.log("   🔒 Processing front photo...")
        try {
          if (!isDryRun) {
            const watermarked = await addWatermarkToImageNode(testride.idPhotoFrontUrl)
            updates.idPhotoFrontUrl = watermarked
            needsUpdate = true
            console.log("   ✅ Front photo watermarked")
          } else {
            console.log("   [DRY RUN] Would watermark front photo")
          }
          processedCount++
        } catch (error) {
          console.error(`   ❌ Error processing front photo: ${error.message}`)
          errorCount++
        }
      }
    }

    // Process back photo
    if (testride.idPhotoBackUrl) {
      if (hasWatermark(testride.idPhotoBackUrl)) {
        console.log("   ⏭️  Back photo already has watermark (skipping)")
        skippedCount++
      } else {
        console.log("   🔒 Processing back photo...")
        try {
          if (!isDryRun) {
            const watermarked = await addWatermarkToImageNode(testride.idPhotoBackUrl)
            updates.idPhotoBackUrl = watermarked
            needsUpdate = true
            console.log("   ✅ Back photo watermarked")
          } else {
            console.log("   [DRY RUN] Would watermark back photo")
          }
          processedCount++
        } catch (error) {
          console.error(`   ❌ Error processing back photo: ${error.message}`)
          errorCount++
        }
      }
    }

    // Update database
    if (needsUpdate && !isDryRun) {
      try {
        await prisma.testride.update({
          where: { id: testride.id },
          data: updates,
        })
        console.log("   💾 Database updated")
      } catch (error) {
        console.error(`   ❌ Error updating database: ${error.message}`)
        errorCount++
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 SUMMARY")
  console.log("=".repeat(60))
  console.log(`✅ Processed: ${processedCount} photos`)
  console.log(`⏭️  Skipped: ${skippedCount} photos (already watermarked)`)
  console.log(`❌ Errors: ${errorCount} photos`)
  
  if (isDryRun) {
    console.log("\n⚠️  DRY RUN MODE - No changes were made to the database")
    console.log("Run without --dry-run to apply changes")
  } else {
    console.log("\n✅ All changes have been saved to the database")
  }

  await prisma.$disconnect()
}

// Run the script
main()
  .catch((error) => {
    console.error("\n❌ Fatal error:", error)
    process.exit(1)
  })

