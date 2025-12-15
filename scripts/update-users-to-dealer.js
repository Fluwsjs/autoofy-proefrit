// Script om alle bestaande ADMIN gebruikers naar DEALER te updaten
// Run met: node scripts/update-users-to-dealer.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Gebruikers rollen bijwerken naar DEALER...\n')

  // Update alle ADMIN users naar DEALER (behalve SuperAdmins, die staan in aparte tabel)
  const result = await prisma.user.updateMany({
    where: {
      role: 'ADMIN'
    },
    data: {
      role: 'DEALER'
    }
  })

  console.log(`✅ ${result.count} gebruikers geüpdatet van ADMIN naar DEALER!\n`)

  // Toon alle users met hun nieuwe rol
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('📋 Alle gebruikers:')
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.name}) → Rol: ${user.role}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

