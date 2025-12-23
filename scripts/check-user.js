const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function check() {
  const email = 'jordy.vhr@gmail.com'
  
  const user = await p.user.findUnique({ where: { email } })
  const tenant = await p.tenant.findUnique({ where: { email } })
  
  console.log('\n=== Check voor:', email, '===\n')
  console.log('User gevonden:', user ? 'JA' : 'NEE')
  if (user) console.log('  -', user.name, '| verified:', user.emailVerified, '| approved:', user.isApproved)
  
  console.log('Tenant gevonden:', tenant ? 'JA' : 'NEE')
  if (tenant) console.log('  -', tenant.name)
  
  // Toon alle users
  console.log('\n=== Alle Users in database ===\n')
  const users = await p.user.findMany({ include: { tenant: true } })
  users.forEach(u => {
    console.log(`- ${u.email} (${u.name}) | Bedrijf: ${u.tenant.name} | verified: ${u.emailVerified} | approved: ${u.isApproved}`)
  })
  
  await p.$disconnect()
}

check()
