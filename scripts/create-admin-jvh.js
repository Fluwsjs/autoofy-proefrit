/**
 * Script om super admin account aan te maken voor adminjvh@admin.local
 * Met sterk wachtwoord volgens security requirements
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createOrUpdateAdmin() {
  try {
    const name = "Admin JVH"
    const email = "adminjvh@admin.local"
    // Sterk wachtwoord: min 8 chars, hoofdletter, kleine letter, cijfer, speciaal teken
    const password = "AdminJVH2024!@#"

    console.log('\n=== Super Admin Account Aanmaken/Updaten ===\n')
    console.log(`Naam: ${name}`)
    console.log(`E-mail: ${email}`)
    console.log(`Wachtwoord: ${password}\n`)

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      console.log('⚠️  Super admin met dit e-mailadres bestaat al!')
      console.log('   Account wordt bijgewerkt met nieuw wachtwoord...\n')
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Update super admin
      const updated = await prisma.superAdmin.update({
        where: { id: existing.id },
        data: {
          password: hashedPassword,
        },
      })

      console.log('✅ Wachtwoord succesvol bijgewerkt!')
      console.log(`   ID: ${updated.id}`)
      console.log(`   Naam: ${updated.name}`)
      console.log(`   E-mail: ${updated.email}`)
    } else {
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
    }

    console.log('\n💡 Login gegevens:')
    console.log(`   E-mail: ${email}`)
    console.log(`   Wachtwoord: ${password}`)
    console.log('\n🌐 Ga naar /admin na het inloggen\n')

  } catch (error) {
    console.error('\n❌ Fout:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createOrUpdateAdmin()








