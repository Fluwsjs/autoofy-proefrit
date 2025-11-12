/**
 * Direct script om super admin aan te maken
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const name = "Admin JVH"
    const email = "adminjvh@admin.local"
    const password = "Italy024!@"

    console.log('\n=== Super Admin Account Aanmaken ===\n')
    console.log(`Naam: ${name}`)
    console.log(`E-mail: ${email}`)
    console.log(`Wachtwoord: ${password}\n`)

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      console.log('⚠️  Super admin met dit e-mailadres bestaat al!')
      console.log('   Account details:')
      console.log(`   ID: ${existing.id}`)
      console.log(`   Naam: ${existing.name}`)
      console.log(`   E-mail: ${existing.email}`)
      await prisma.$disconnect()
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
    console.log('\n💡 Je kunt nu inloggen met:')
    console.log(`   E-mail: ${email}`)
    console.log(`   Wachtwoord: ${password}`)
    console.log('\n🌐 Ga naar /admin na het inloggen\n')

  } catch (error) {
    console.error('\n❌ Fout:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

