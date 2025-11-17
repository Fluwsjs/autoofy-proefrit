const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function debugLogin() {
  try {
    console.log('🔍 Debugging login issue...\n')
    
    // Get all recent users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        createdAt: true,
        password: true
      }
    })
    
    console.log('📋 Recent users:')
    users.forEach((u, i) => {
      console.log(`\n${i + 1}. ${u.email}`)
      console.log(`   Name: ${u.name}`)
      console.log(`   Email Verified: ${u.emailVerified ? '✅' : '❌'}`)
      console.log(`   Created: ${u.createdAt.toLocaleString('nl-NL')}`)
      console.log(`   Password hash: ${u.password.substring(0, 20)}...`)
    })
    
    console.log('\n💡 Tips:')
    console.log('   - Als emailVerified = false, moet je eerst de verificatie email klikken')
    console.log('   - Check of je het juiste email adres gebruikt (case-sensitive)')
    console.log('   - Check of je het juiste wachtwoord gebruikt')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin()

