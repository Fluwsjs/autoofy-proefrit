// Script om alle bestaande gebruikers automatisch goed te keuren
// Run met: node scripts/approve-existing-users.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Bestaande gebruikers goedkeuren...\n')

  // Update alle bestaande users naar isApproved = true
  const result = await prisma.user.updateMany({
    where: {
      isApproved: false
    },
    data: {
      isApproved: true,
      approvedAt: new Date()
    }
  })

  console.log(`✅ ${result.count} gebruikers zijn nu goedgekeurd!\n`)

  // Toon alle users
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      isApproved: true,
      emailVerified: true,
      createdAt: true
    }
  })

  console.log('📋 Alle gebruikers:')
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.name})`)
    console.log(`     Geverifieerd: ${user.emailVerified ? '✅' : '❌'} | Goedgekeurd: ${user.isApproved ? '✅' : '❌'}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

