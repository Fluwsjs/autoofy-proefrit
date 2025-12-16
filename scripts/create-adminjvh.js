const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createAdminJVH() {
  try {
    const name = "Support l Proefrit Autoofy"
    const email = "support@proefrit-autoofy.nl"
    const password = "Picobello123!@"
    
    console.log('\n=== Super Admin Account Aanmaken ===\n')
    console.log(`Naam: ${name}`)
    console.log(`E-mail: ${email}\n`)

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      console.log('⚠️  Super admin met dit e-mailadres bestaat al!')
      console.log('   Updating password...')
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.superAdmin.update({
        where: { id: existing.id },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Wachtwoord bijgewerkt!')
      console.log(`   ID: ${existing.id}`)
      console.log(`   Naam: ${existing.name}`)
      console.log(`   E-mail: ${existing.email}`)
      console.log('\n💡 Je kunt nu inloggen met dit account op /admin\n')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create super admin
    const superAdmin = await prisma.superAdmin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    console.log('✅ Super admin succesvol aangemaakt!')
    console.log(`   ID: ${superAdmin.id}`)
    console.log(`   Naam: ${superAdmin.name}`)
    console.log(`   E-mail: ${superAdmin.email}`)
    console.log('\n💡 Je kunt nu inloggen met dit account op /admin\n')

  } catch (error) {
    console.error('\n❌ Fout:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminJVH()

