const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupAllUsers() {
  console.log('🧹 Starting cleanup of all users and related data...\n')
  
  try {
    // Step 1: Count current data
    console.log('1. Counting current data...')
    const tenantCount = await prisma.tenant.count()
    const userCount = await prisma.user.count()
    const testrideCount = await prisma.testride.count()
    const dealerPlateCount = await prisma.dealerPlate.count()
    const verificationTokenCount = await prisma.verificationToken.count()
    const passwordResetTokenCount = await prisma.passwordResetToken.count()
    const superAdminCount = await prisma.superAdmin.count()
    
    console.log(`   Tenants: ${tenantCount}`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Testrides: ${testrideCount}`)
    console.log(`   Dealer Plates: ${dealerPlateCount}`)
    console.log(`   Verification Tokens: ${verificationTokenCount}`)
    console.log(`   Password Reset Tokens: ${passwordResetTokenCount}`)
    console.log(`   Super Admins: ${superAdminCount}`)
    console.log('')
    
    if (tenantCount === 0 && userCount === 0 && testrideCount === 0) {
      console.log('✅ Database is already empty. Nothing to clean up.')
      return
    }
    
    // Step 2: Delete in correct order (respecting foreign key constraints)
    console.log('2. Deleting data (in correct order)...')
    
    // Delete testrides first (they reference tenants and dealer plates)
    if (testrideCount > 0) {
      const deletedTestrides = await prisma.testride.deleteMany({})
      console.log(`   ✅ Deleted ${deletedTestrides.count} testrides`)
    }
    
    // Delete dealer plates (they reference users)
    if (dealerPlateCount > 0) {
      const deletedPlates = await prisma.dealerPlate.deleteMany({})
      console.log(`   ✅ Deleted ${deletedPlates.count} dealer plates`)
    }
    
    // Delete verification tokens (they reference users)
    if (verificationTokenCount > 0) {
      const deletedVerificationTokens = await prisma.verificationToken.deleteMany({})
      console.log(`   ✅ Deleted ${deletedVerificationTokens.count} verification tokens`)
    }
    
    // Delete password reset tokens (they reference users)
    if (passwordResetTokenCount > 0) {
      const deletedPasswordResetTokens = await prisma.passwordResetToken.deleteMany({})
      console.log(`   ✅ Deleted ${deletedPasswordResetTokens.count} password reset tokens`)
    }
    
    // Delete users (they reference tenants)
    if (userCount > 0) {
      const deletedUsers = await prisma.user.deleteMany({})
      console.log(`   ✅ Deleted ${deletedUsers.count} users`)
    }
    
    // Delete tenants (they reference users and testrides, but those are already deleted)
    if (tenantCount > 0) {
      const deletedTenants = await prisma.tenant.deleteMany({})
      console.log(`   ✅ Deleted ${deletedTenants.count} tenants`)
    }
    
    // Note: We keep SuperAdmins as they are system-level accounts
    if (superAdminCount > 0) {
      console.log(`   ℹ️  Keeping ${superAdminCount} super admin(s) (system accounts)`)
    }
    
    console.log('')
    
    // Step 3: Verify cleanup
    console.log('3. Verifying cleanup...')
    const remainingTenants = await prisma.tenant.count()
    const remainingUsers = await prisma.user.count()
    const remainingTestrides = await prisma.testride.count()
    const remainingDealerPlates = await prisma.dealerPlate.count()
    const remainingVerificationTokens = await prisma.verificationToken.count()
    const remainingPasswordResetTokens = await prisma.passwordResetToken.count()
    
    if (remainingTenants === 0 && 
        remainingUsers === 0 && 
        remainingTestrides === 0 && 
        remainingDealerPlates === 0 &&
        remainingVerificationTokens === 0 &&
        remainingPasswordResetTokens === 0) {
      console.log('✅ Cleanup successful!')
      console.log('   All users, tenants, testrides, and related data have been removed.')
      console.log('   Super admins have been kept (system accounts).')
    } else {
      console.log('⚠️  Some data remains:')
      if (remainingTenants > 0) console.log(`   - ${remainingTenants} tenants`)
      if (remainingUsers > 0) console.log(`   - ${remainingUsers} users`)
      if (remainingTestrides > 0) console.log(`   - ${remainingTestrides} testrides`)
      if (remainingDealerPlates > 0) console.log(`   - ${remainingDealerPlates} dealer plates`)
      if (remainingVerificationTokens > 0) console.log(`   - ${remainingVerificationTokens} verification tokens`)
      if (remainingPasswordResetTokens > 0) console.log(`   - ${remainingPasswordResetTokens} password reset tokens`)
    }
    
    console.log('')
    console.log('✅ Cleanup completed!')
    console.log('   You can now start fresh with new registrations.')
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run cleanup
cleanupAllUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

