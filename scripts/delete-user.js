const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteUser() {
  try {
    const email = process.argv[2]
    
    if (!email) {
      console.log('❌ Gebruik: node scripts/delete-user.js <email>')
      console.log('   Voorbeeld: node scripts/delete-user.js jordy.vhr@gmail.com')
      return
    }
    
    console.log(`🔍 Zoeken naar gebruiker: ${email}\n`)
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { 
        tenant: true,
        dealerPlates: true,
        emailVerificationToken: true,
        passwordResetToken: true
      }
    })
    
    if (!user) {
      console.log(`❌ Gebruiker met email ${email} niet gevonden`)
      return
    }
    
    console.log(`✅ Gebruiker gevonden:`)
    console.log(`   Naam: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Tenant: ${user.tenant.name}`)
    console.log(`   Dealer Plates: ${user.dealerPlates.length}`)
    console.log(`   Testrides: (worden automatisch verwijderd)\n`)
    
    // Delete in correct order
    console.log('🗑️  Verwijderen...')
    
    // Delete testrides first (they reference tenant and dealer plates)
    const testrideCount = await prisma.testride.count({
      where: { tenantId: user.tenantId }
    })
    if (testrideCount > 0) {
      await prisma.testride.deleteMany({
        where: { tenantId: user.tenantId }
      })
      console.log(`   ✅ ${testrideCount} testride(s) verwijderd`)
    }
    
    // Delete dealer plates
    if (user.dealerPlates.length > 0) {
      await prisma.dealerPlate.deleteMany({
        where: { userId: user.id }
      })
      console.log(`   ✅ ${user.dealerPlates.length} dealer plate(s) verwijderd`)
    }
    
    // Delete verification tokens
    if (user.emailVerificationToken) {
      await prisma.verificationToken.deleteMany({
        where: { userId: user.id }
      })
      console.log(`   ✅ Verification token(s) verwijderd`)
    }
    
    // Delete password reset tokens
    if (user.passwordResetToken) {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      })
      console.log(`   ✅ Password reset token(s) verwijderd`)
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: user.id }
    })
    console.log(`   ✅ User verwijderd`)
    
    // Delete tenant
    await prisma.tenant.delete({
      where: { id: user.tenantId }
    })
    console.log(`   ✅ Tenant verwijderd`)
    
    console.log('\n✅ Gebruiker en alle gerelateerde data zijn verwijderd!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser()

