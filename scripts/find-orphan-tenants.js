const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const p = new PrismaClient()

async function findOrphanTenants() {
  console.log('\n=== Tenants Zonder User (Orphans) ===\n')
  
  const tenants = await p.tenant.findMany({
    include: { users: true }
  })
  
  const orphans = tenants.filter(t => t.users.length === 0)
  
  if (orphans.length === 0) {
    console.log('✅ Alle Tenants hebben minimaal 1 User!\n')
    await p.$disconnect()
    return
  }
  
  console.log(`⚠️  ${orphans.length} Tenants zonder User gevonden:\n`)
  
  for (const tenant of orphans) {
    console.log(`- ${tenant.name} (${tenant.email})`)
  }
  
  // Fix optie
  console.log('\n--- Automatisch fixen? ---\n')
  
  const defaultPassword = 'Welkom123!'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)
  
  for (const tenant of orphans) {
    // Check of email al als User bestaat (dubbele check)
    const existing = await p.user.findUnique({ where: { email: tenant.email } })
    if (existing) {
      console.log(`⏭️  Skip ${tenant.email} - User bestaat al bij ander bedrijf`)
      continue
    }
    
    await p.user.create({
      data: {
        tenantId: tenant.id,
        name: tenant.name,
        email: tenant.email,
        password: hashedPassword,
        role: 'DEALER',
        emailVerified: true,
        isApproved: true,
        isActive: true,
      }
    })
    console.log(`✅ User aangemaakt voor: ${tenant.email}`)
  }
  
  console.log(`\n🔑 Standaard wachtwoord voor nieuwe users: ${defaultPassword}\n`)
  
  await p.$disconnect()
}

findOrphanTenants()

