const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function check() {
  const tenant = await p.tenant.findFirst()
  console.log('Tenant velden:', Object.keys(tenant || {}))
  
  // Check of password bestaat
  console.log('Heeft password:', tenant && 'password' in tenant)
  
  await p.$disconnect()
}

check()

