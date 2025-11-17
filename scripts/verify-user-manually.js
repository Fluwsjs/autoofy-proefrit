const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyUser() {
  try {
    const email = process.argv[2]
    
    if (!email) {
      console.log('❌ Gebruik: node scripts/verify-user-manually.js <email>')
      console.log('   Voorbeeld: node scripts/verify-user-manually.js jordy.vhr@gmail.com')
      return
    }
    
    console.log(`🔍 Zoeken naar gebruiker: ${email}\n`)
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { tenant: true }
    })
    
    if (!user) {
      console.log(`❌ Gebruiker met email ${email} niet gevonden`)
      return
    }
    
    console.log(`✅ Gebruiker gevonden:`)
    console.log(`   Naam: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Geverifieerd: ${user.emailVerified ? 'Ja' : 'Nee'}\n`)
    
    if (user.emailVerified) {
      console.log('✅ Gebruiker is al geverifieerd!')
      return
    }
    
    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      }
    })
    
    console.log('✅ Gebruiker is nu geverifieerd!')
    console.log('   Je kunt nu inloggen met je email en wachtwoord.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

verifyUser()

