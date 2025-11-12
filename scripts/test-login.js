const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = "adminjvh@admin.local"
    const password = "Italy024!@"
    
    console.log('Testing login...')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}\n`)
    
    const admin = await prisma.superAdmin.findUnique({
      where: { email }
    })
    
    if (!admin) {
      console.log('❌ Admin niet gevonden')
      return
    }
    
    console.log('✅ Admin gevonden')
    console.log(`Hashed password: ${admin.password.substring(0, 20)}...\n`)
    
    const isValid = await bcrypt.compare(password, admin.password)
    
    if (isValid) {
      console.log('✅ Wachtwoord is CORRECT!')
    } else {
      console.log('❌ Wachtwoord is INCORRECT!')
      console.log('\nProbeer het account opnieuw aan te maken...')
      
      // Recreate with correct password
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.superAdmin.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      })
      console.log('✅ Wachtwoord opnieuw gehasht en opgeslagen')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()

