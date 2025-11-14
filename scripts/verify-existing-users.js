/**
 * Script om bestaande gebruikers automatisch te verifiëren
 * Dit is nodig omdat we email verificatie hebben toegevoegd
 * maar bestaande gebruikers nog niet geverifieerd zijn
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyExistingUsers() {
  try {
    console.log('🔍 Controleren op niet-geverifieerde gebruikers...')
    
    // Vind alle gebruikers die nog niet geverifieerd zijn
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: false,
      },
    })

    if (unverifiedUsers.length === 0) {
      console.log('✅ Alle gebruikers zijn al geverifieerd!')
      return
    }

    console.log(`📧 Gevonden ${unverifiedUsers.length} niet-geverifieerde gebruiker(s)`)

    // Verifieer alle bestaande gebruikers
    const result = await prisma.user.updateMany({
      where: {
        emailVerified: false,
      },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    })

    console.log(`✅ ${result.count} gebruiker(s) succesvol geverifieerd!`)
    console.log('\n💡 Tip: Nieuwe gebruikers moeten nu eerst hun email verifiëren voordat ze kunnen inloggen.')
    
  } catch (error) {
    console.error('❌ Fout bij verifiëren van gebruikers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run script
verifyExistingUsers()
  .then(() => {
    console.log('\n✨ Script voltooid!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script gefaald:', error)
    process.exit(1)
  })

