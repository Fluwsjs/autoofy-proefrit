const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function resetPasswordDirect() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]
    
    if (!email || !password) {
      console.log('❌ Gebruik: node scripts/reset-password-direct.js <email> <wachtwoord>')
      console.log('   Voorbeeld: node scripts/reset-password-direct.js jordy.vhr@gmail.com NieuwWachtwoord123!')
      return
    }
    
    console.log(`🔐 Password reset voor: ${email}\n`)
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (!user) {
      console.log(`❌ Gebruiker niet gevonden`)
      return
    }
    
    console.log(`✅ Gebruiker gevonden: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}\n`)
    
    if (password.length < 8) {
      console.log('❌ Wachtwoord moet minimaal 8 tekens lang zijn')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Wachtwoord succesvol gereset!')
    console.log(`\n📧 Login gegevens:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Wachtwoord: ${password}`)
    console.log(`\n💡 Je kunt nu inloggen met deze gegevens.`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

resetPasswordDirect()

