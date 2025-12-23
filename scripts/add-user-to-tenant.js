const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function addUserToTenant() {
  try {
    // ====== CONFIGURATIE - PAS DIT AAN ======
    const userEmail = "jordy.vhr@gmail.com"
    const userName = "Jordy VHR"
    const userPassword = "Welkom123!" // Tijdelijk wachtwoord
    const tenantEmail = "jordy-vh@live.nl" // Email van het bedrijf waar de user bij moet
    // ========================================

    console.log('\n=== Gebruiker Toevoegen aan Bedrijf ===\n')

    // Zoek het bedrijf
    const tenant = await prisma.tenant.findUnique({
      where: { email: tenantEmail },
      include: { users: true }
    })

    if (!tenant) {
      console.log(`❌ Bedrijf met email "${tenantEmail}" niet gevonden!`)
      console.log('\nBeschikbare bedrijven:')
      const tenants = await prisma.tenant.findMany({ select: { name: true, email: true } })
      tenants.forEach(t => console.log(`   - ${t.name} (${t.email})`))
      return
    }

    console.log(`✅ Bedrijf gevonden: ${tenant.name}`)
    console.log(`   Huidige gebruikers: ${tenant.users.length}`)

    // Check of user al bestaat
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (existingUser) {
      console.log(`\n⚠️  Gebruiker met email "${userEmail}" bestaat al!`)
      console.log(`   Naam: ${existingUser.name}`)
      console.log(`   Bedrijf ID: ${existingUser.tenantId}`)
      return
    }

    // Maak de user aan
    const hashedPassword = await bcrypt.hash(userPassword, 10)
    
    const newUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: userName,
        email: userEmail,
        password: hashedPassword,
        role: 'DEALER',
        emailVerified: true,
        isApproved: true,
        isActive: true,
      }
    })

    console.log('\n✅ Gebruiker succesvol aangemaakt!')
    console.log(`   ID: ${newUser.id}`)
    console.log(`   Naam: ${newUser.name}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Bedrijf: ${tenant.name}`)
    console.log(`\n🔑 Tijdelijk wachtwoord: ${userPassword}`)
    console.log('   (Verander dit na eerste login!)\n')

  } catch (error) {
    console.error('\n❌ Fout:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

addUserToTenant()

