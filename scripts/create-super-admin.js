/**
 * Script om een super admin account aan te maken
 * 
 * Gebruik: node scripts/create-super-admin.js
 * Of: npm run create-admin
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createSuperAdmin() {
  try {
    console.log('\n=== Super Admin Account Aanmaken ===\n')

    const name = await question('Naam: ')
    const email = await question('E-mailadres: ')
    const password = await question('Wachtwoord: ')

    if (!name || !email || !password) {
      console.error('\n❌ Alle velden zijn verplicht!')
      process.exit(1)
    }

    if (password.length < 6) {
      console.error('\n❌ Wachtwoord moet minimaal 6 tekens lang zijn!')
      process.exit(1)
    }

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      console.error('\n❌ Super admin met dit e-mailadres bestaat al!')
      process.exit(1)
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

    console.log('\n✅ Super admin succesvol aangemaakt!')
    console.log(`   ID: ${superAdmin.id}`)
    console.log(`   Naam: ${superAdmin.name}`)
    console.log(`   E-mail: ${superAdmin.email}`)
    console.log('\n💡 Je kunt nu inloggen met dit account op /admin\n')

  } catch (error) {
    console.error('\n❌ Fout:', error.message)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createSuperAdmin()

