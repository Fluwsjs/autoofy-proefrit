const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function updateAdminJVH() {
  try {
    const email = "adminjvh@admin.local"
    const name = "adminjvh"
    const password = "Italy024!@"
    
    console.log('\n=== Super Admin Account Bijwerken ===\n')

    // Find existing admin
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (!existing) {
      console.log('❌ Super admin niet gevonden!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update super admin
    const superAdmin = await prisma.superAdmin.update({
      where: { id: existing.id },
      data: {
        name,
        password: hashedPassword,
      },
    })

    console.log('✅ Super admin succesvol bijgewerkt!')
    console.log(`   ID: ${superAdmin.id}`)
    console.log(`   Naam: ${superAdmin.name}`)
    console.log(`   E-mail: ${superAdmin.email}`)
    console.log('\n💡 Je kunt nu inloggen met:')
    console.log(`   E-mail: ${email}`)
    console.log(`   Wachtwoord: ${password}`)
    console.log('\n🌐 Ga naar /admin na het inloggen\n')

  } catch (error) {
    console.error('\n❌ Fout:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminJVH()

