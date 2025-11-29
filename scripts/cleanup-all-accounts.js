/**
 * Cleanup Script - Verwijder Alle Test Accounts
 * 
 * ⚠️ WAARSCHUWING: Dit verwijdert ALLE data uit de database!
 * Gebruik dit alleen in development/testing omgeving.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupAllAccounts() {
  console.log('\n🧹 Database Cleanup Gestart...\n')

  try {
    // Stap 1: Verwijder alle verification tokens
    console.log('📧 Verwijderen verification tokens...')
    const deletedTokens = await prisma.verificationToken.deleteMany({})
    console.log(`   ✅ ${deletedTokens.count} verification tokens verwijderd`)

    // Stap 2: Verwijder alle password reset tokens
    console.log('🔑 Verwijderen password reset tokens...')
    const deletedResetTokens = await prisma.passwordResetToken.deleteMany({})
    console.log(`   ✅ ${deletedResetTokens.count} password reset tokens verwijderd`)

    // Stap 3: Verwijder alle dealer plates
    console.log('🔢 Verwijderen dealer plates...')
    let deletedPlates = { count: 0 }
    try {
      deletedPlates = await prisma.dealerPlate.deleteMany({})
    } catch (e) {
      // Model bestaat mogelijk niet
    }
    console.log(`   ✅ ${deletedPlates.count} dealer plates verwijderd`)

    // Stap 4: Verwijder alle test rides (proefritten)
    console.log('🚗 Verwijderen test rides...')
    let deletedTestRides = { count: 0 }
    try {
      deletedTestRides = await prisma.testride.deleteMany({})
    } catch (e) {
      // Model bestaat mogelijk niet
    }
    console.log(`   ✅ ${deletedTestRides.count} test rides verwijderd`)

    // Stap 5: Verwijder alle users
    console.log('👤 Verwijderen users...')
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`   ✅ ${deletedUsers.count} users verwijderd`)

    // Stap 6: Verwijder alle tenants
    console.log('🏢 Verwijderen tenants...')
    const deletedTenants = await prisma.tenant.deleteMany({})
    console.log(`   ✅ ${deletedTenants.count} tenants verwijderd`)

    console.log('\n✅ Database cleanup compleet!')
    console.log('\n📊 Samenvatting:')
    console.log(`   - ${deletedTokens.count} verification tokens`)
    console.log(`   - ${deletedResetTokens.count} password reset tokens`)
    console.log(`   - ${deletedPlates.count} dealer plates`)
    console.log(`   - ${deletedTestRides.count} test rides`)
    console.log(`   - ${deletedUsers.count} users`)
    console.log(`   - ${deletedTenants.count} tenants`)
    console.log('\n🎉 Je kunt nu opnieuw beginnen met registreren!\n')

  } catch (error) {
    console.error('\n❌ Error tijdens cleanup:', error)
    console.error('\nDetails:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Vraag bevestiging in development
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Dit script kan niet worden uitgevoerd in productie!')
  console.error('   Set NODE_ENV naar development of verwijder deze check.')
  process.exit(1)
}

// Voer cleanup uit
cleanupAllAccounts()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })

