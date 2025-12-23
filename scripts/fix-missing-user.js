const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const p = new PrismaClient()

async function fixMissingUser() {
  const email = 'jordy.vhr@gmail.com'
  const password = 'TijdelijkWachtwoord123!' // Tijdelijk wachtwoord
  
  console.log('\n=== Fix Ontbrekende User ===\n')
  
  // Check of Tenant bestaat
  const tenant = await p.tenant.findUnique({ where: { email } })
  
  if (!tenant) {
    console.log('❌ Geen Tenant gevonden voor:', email)
    await p.$disconnect()
    return
  }
  
  console.log('✅ Tenant gevonden:', tenant.name)
  
  // Check of User al bestaat
  const existingUser = await p.user.findUnique({ where: { email } })
  
  if (existingUser) {
    console.log('⚠️  User bestaat al!')
    await p.$disconnect()
    return
  }
  
  // Maak User aan
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await p.user.create({
    data: {
      tenantId: tenant.id,
      name: tenant.name,
      email: email,
      password: hashedPassword,
      role: 'DEALER',
      emailVerified: true,
      isApproved: true,
      isActive: true,
    }
  })
  
  console.log('\n✅ User aangemaakt!')
  console.log('   ID:', user.id)
  console.log('   Email:', user.email)
  console.log('   Bedrijf:', tenant.name)
  console.log('\n🔑 Tijdelijk wachtwoord:', password)
  console.log('   (Verander dit via "Wachtwoord vergeten")\n')
  
  await p.$disconnect()
}

fixMissingUser()

