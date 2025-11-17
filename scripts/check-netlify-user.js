const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkNetlifyUser() {
  try {
    const email = process.argv[2] || 'jordy.vhr@gmail.com'
    
    console.log(`🔍 Checking user status for Netlify database...\n`)
    console.log(`⚠️  BELANGRIJK: Zorg dat DATABASE_URL in .env wijst naar Netlify database!\n`)
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenant: true,
        emailVerificationToken: true
      }
    })
    
    if (!user) {
      console.log(`❌ Gebruiker niet gevonden in database`)
      console.log(`\n💡 Mogelijkheden:`)
      console.log(`   1. Database URL wijst naar verkeerde database`)
      console.log(`   2. Gebruiker bestaat niet in deze database`)
      console.log(`   3. Email is anders gespeld`)
      return
    }
    
    console.log(`✅ Gebruiker gevonden:`)
    console.log(`   Naam: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`)
    console.log(`   Tenant: ${user.tenant.name}`)
    console.log(`   Created: ${user.createdAt.toLocaleString('nl-NL')}\n`)
    
    if (!user.emailVerified) {
      console.log(`⚠️  PROBLEEM: Email is NIET geverifieerd!`)
      console.log(`\n🔧 Oplossing: Verifieer de gebruiker met:`)
      console.log(`   node scripts/verify-user-manually.js ${email}`)
    } else {
      console.log(`✅ Email is geverifieerd`)
    }
    
    if (user.emailVerificationToken) {
      const token = user.emailVerificationToken
      const isExpired = token.expiresAt < new Date()
      console.log(`\n📧 Verification Token:`)
      console.log(`   Status: ${isExpired ? '❌ Verlopen' : '✅ Actief'}`)
      console.log(`   Expires: ${token.expiresAt.toLocaleString('nl-NL')}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n💡 Check of DATABASE_URL correct is ingesteld in .env')
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkNetlifyUser()

