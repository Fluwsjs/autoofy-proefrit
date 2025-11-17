const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function resetPassword() {
  try {
    const email = process.argv[2]
    
    if (!email) {
      console.log('❌ Gebruik: node scripts/reset-user-password.js <email>')
      console.log('   Voorbeeld: node scripts/reset-user-password.js imfloes@gmail.com')
      rl.close()
      return
    }
    
    console.log(`🔐 Password reset voor: ${email}\n`)
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (!user) {
      console.log(`❌ Gebruiker niet gevonden`)
      rl.close()
      return
    }
    
    console.log(`✅ Gebruiker gevonden: ${user.name}`)
    console.log(`   Email: ${user.email}\n`)
    
    // Ask for new password
    const newPassword = await question('Voer nieuw wachtwoord in (min 8 tekens, hoofdletter, kleine letter, cijfer, speciaal teken): ')
    
    if (newPassword.length < 8) {
      console.log('❌ Wachtwoord moet minimaal 8 tekens lang zijn')
      rl.close()
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    console.log('\n✅ Wachtwoord succesvol gereset!')
    console.log(`   Je kunt nu inloggen met email: ${user.email}`)
    console.log(`   En het nieuwe wachtwoord dat je zojuist hebt ingevoerd.`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

resetPassword()

