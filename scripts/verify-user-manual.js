/**
 * Script om een gebruiker handmatig te verifiëren (email verificatie overslaan)
 * 
 * Gebruik:
 *   node scripts/verify-user-manual.js <EMAIL>
 *   node scripts/verify-user-manual.js info@benikgelekt.nl
 */

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.log("❌ Gebruik: node scripts/verify-user-manual.js <EMAIL>")
    console.log("")
    console.log("Voorbeeld:")
    console.log("  node scripts/verify-user-manual.js info@benikgelekt.nl")
    process.exit(1)
  }

  console.log(`🔍 Zoeken naar gebruiker met email: ${email}`)
  console.log("")

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenant: true,
      },
    })

    if (!user) {
      console.log(`❌ Geen gebruiker gevonden met email: ${email}`)
      process.exit(1)
    }

    console.log("📋 Gebruiker gevonden:")
    console.log(`   Naam: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Bedrijf: ${user.tenant?.name || "Onbekend"}`)
    console.log(`   Email geverifieerd: ${user.emailVerified ? "✅ Ja" : "❌ Nee"}`)
    console.log(`   Account goedgekeurd: ${user.isApproved ? "✅ Ja" : "❌ Nee"}`)
    console.log(`   Account actief: ${user.isActive ? "✅ Ja" : "❌ Nee"}`)
    console.log("")

    if (user.emailVerified && user.isApproved) {
      console.log("✅ Gebruiker is al volledig geactiveerd!")
      process.exit(0)
    }

    // Update user - verify email and approve
    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isApproved: true,
      },
    })

    // Delete any pending verification tokens
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    })

    console.log("✅ Gebruiker succesvol geactiveerd!")
    console.log("")
    console.log("   ✓ Email geverifieerd: Ja")
    console.log("   ✓ Account goedgekeurd: Ja")
    console.log("")
    console.log(`🔗 De gebruiker kan nu inloggen op de website.`)

  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

