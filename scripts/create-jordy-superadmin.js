const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createJordySuperAdmin() {
  try {
    const name = "Jordy van Hoof"
    const email = "jordy@proefrit-autoofy.nl"
    // Sterk wachtwoord: hoofdletters, kleine letters, cijfers, speciale tekens
    const password = "Pr0efR!t@ut00fy2025#Sec"
    
    console.log('\n=== Super Admin Account Aanmaken ===\n')
    console.log(`Naam: ${name}`)
    console.log(`E-mail: ${email}`)
    console.log(`Wachtwoord: ${password}`)
    console.log('\n⚠️  BELANGRIJK: Bewaar dit wachtwoord veilig!\n')

    // Check if super admin already exists
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    })

    if (existing) {
      console.log('⚠️  Super admin met dit e-mailadres bestaat al!')
      console.log('   Wil je het wachtwoord updaten? (Druk Ctrl+C om te stoppen)\n')
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10)
      const updated = await prisma.superAdmin.update({
        where: { id: existing.id },
        data: { 
          password: hashedPassword,
          name: name // Update name ook
        }
      })
      
      console.log('✅ Super admin bijgewerkt!')
      console.log(`   ID: ${updated.id}`)
      console.log(`   Naam: ${updated.name}`)
      console.log(`   E-mail: ${updated.email}`)
      console.log(`   Nieuw wachtwoord: ${password}`)
      console.log('\n💡 Je kunt nu inloggen op /admin\n')
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
    console.log(`   Wachtwoord: ${password}`)
    console.log('\n💡 Login informatie:')
    console.log(`   URL: https://proefrit-autoofy.nl/admin`)
    console.log(`   E-mail: ${email}`)
    console.log(`   Wachtwoord: ${password}`)
    console.log('\n⚠️  BEWAAR DEZE GEGEVENS VEILIG!\n')

  } catch (error) {
    console.error('\n❌ Fout:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createJordySuperAdmin()

