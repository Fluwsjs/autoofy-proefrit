const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testLoginFlow() {
  try {
    const email = "jordy.vhr@gmail.com"
    const password = "Italy024!@"
    
    console.log('🔍 Testing complete login flow...\n')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}\n`)
    
    // Step 1: Normalize email
    const normalizedEmail = email.trim().toLowerCase()
    console.log(`1. Normalized email: ${normalizedEmail}\n`)
    
    // Step 2: Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { tenant: true }
    })
    
    if (!user) {
      console.log('❌ User niet gevonden')
      return
    }
    
    console.log('✅ User gevonden:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`)
    console.log(`   Tenant: ${user.tenant.name}\n`)
    
    // Step 3: Check password
    console.log('2. Testing password...')
    console.log(`   Password hash: ${user.password.substring(0, 30)}...`)
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (isPasswordValid) {
      console.log('✅ Wachtwoord is CORRECT!\n')
      
      // Step 4: Simulate what auth.ts returns
      console.log('3. Simulating auth response...')
      const authResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        isSuperAdmin: false,
      }
      
      console.log('✅ Auth response zou zijn:')
      console.log(JSON.stringify(authResponse, null, 2))
      console.log('\n✅ Login zou moeten werken!')
    } else {
      console.log('❌ Wachtwoord is INCORRECT!')
      console.log('\n💡 Mogelijke oorzaken:')
      console.log('   - Wachtwoord is niet correct gehasht')
      console.log('   - Wachtwoord in database komt niet overeen')
      console.log('\n🔧 Oplossing: Reset het wachtwoord opnieuw')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginFlow()

