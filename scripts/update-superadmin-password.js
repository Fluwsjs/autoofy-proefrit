const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function updateSuperAdminPassword() {
  try {
    const email = "jordy@proefrit-autoofy.nl"
    const newPassword = "Italy024!@"

    console.log('\n🔐 Updating SuperAdmin password...\n')

    // Find the SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email }
    })

    if (!superAdmin) {
      console.error(`❌ SuperAdmin met email ${email} niet gevonden!`)
      return
    }

    console.log(`✅ SuperAdmin gevonden:`)
    console.log(`   Naam: ${superAdmin.name}`)
    console.log(`   Email: ${superAdmin.email}`)
    console.log(`   ID: ${superAdmin.id}\n`)

    // Hash the new password
    console.log('🔒 Hashing nieuw wachtwoord...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password
    await prisma.superAdmin.update({
      where: { id: superAdmin.id },
      data: { password: hashedPassword }
    })

    console.log('\n✅ Wachtwoord succesvol bijgewerkt!\n')
    console.log('📋 Login gegevens:')
    console.log(`   URL: https://proefrit-autoofy.nl/admin`)
    console.log(`   Email: ${email}`)
    console.log(`   Wachtwoord: ${newPassword}`)
    console.log('\n⚠️  BEWAAR DEZE GEGEVENS VEILIG!\n')

  } catch (error) {
    console.error('\n❌ Fout bij bijwerken wachtwoord:', error.message)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSuperAdminPassword()

