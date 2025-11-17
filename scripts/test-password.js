const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testPassword() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]
    
    if (!email || !password) {
      console.log('❌ Gebruik: node scripts/test-password.js <email> <password>')
      console.log('   Voorbeeld: node scripts/test-password.js imfloes@gmail.com jouw-wachtwoord')
      return
    }
    
    console.log(`🔍 Testing password for: ${email}\n`)
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (!user) {
      console.log(`❌ Gebruiker niet gevonden`)
      return
    }
    
    console.log(`✅ Gebruiker gevonden:`)
    console.log(`   Naam: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`)
    console.log(`   Password hash: ${user.password.substring(0, 30)}...\n`)
    
    console.log(`🔐 Testing password...`)
    const isValid = await bcrypt.compare(password, user.password)
    
    if (isValid) {
      console.log(`✅ Wachtwoord is CORRECT!`)
    } else {
      console.log(`❌ Wachtwoord is INCORRECT!`)
      console.log(`\n💡 Mogelijke oorzaken:`)
      console.log(`   - Verkeerd wachtwoord ingevoerd`)
      console.log(`   - Wachtwoord is niet correct gehasht tijdens registratie`)
      console.log(`\n🔧 Oplossing: Reset het wachtwoord of maak een nieuw account aan`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()

