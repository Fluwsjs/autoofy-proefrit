const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testAuth() {
  try {
    const email = "adminjvh@admin.local"
    const password = "Italy024!@"
    
    console.log('Testing authentication flow...\n')
    
    // Step 1: Check super admin
    console.log('1. Checking for super admin...')
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    })
    
    if (!superAdmin) {
      console.log('❌ Super admin niet gevonden')
      return
    }
    
    console.log('✅ Super admin gevonden')
    console.log(`   ID: ${superAdmin.id}`)
    console.log(`   Name: ${superAdmin.name}`)
    console.log(`   Email: ${superAdmin.email}\n`)
    
    // Step 2: Check password
    console.log('2. Verifying password...')
    const isValid = await bcrypt.compare(password, superAdmin.password)
    
    if (!isValid) {
      console.log('❌ Wachtwoord is incorrect')
      console.log('\nLaten we het wachtwoord opnieuw hashen...')
      const newHash = await bcrypt.hash(password, 10)
      await prisma.superAdmin.update({
        where: { id: superAdmin.id },
        data: { password: newHash }
      })
      console.log('✅ Wachtwoord opnieuw gehasht')
    } else {
      console.log('✅ Wachtwoord is correct\n')
    }
    
    // Step 3: Check if regular user exists with same email
    console.log('3. Checking for regular user with same email...')
    const regularUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (regularUser) {
      console.log('⚠️  WARNING: Er bestaat ook een regular user met dit e-mailadres!')
      console.log(`   User ID: ${regularUser.id}`)
      console.log('   Dit kan conflicten veroorzaken in de auth flow\n')
    } else {
      console.log('✅ Geen regular user met dit e-mailadres\n')
    }
    
    console.log('✅ Authenticatie flow test voltooid')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()

