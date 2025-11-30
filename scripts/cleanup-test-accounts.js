const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupTestAccounts() {
  try {
    console.log('\n🧹 Starting cleanup of test accounts...\n')

    // Step 1: Get all SuperAdmins (we want to keep these)
    const superAdmins = await prisma.superAdmin.findMany({
      select: { id: true, email: true, name: true }
    })
    
    console.log(`✅ Found ${superAdmins.length} SuperAdmin(s) to KEEP:`)
    superAdmins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`)
    })
    console.log('')

    // Step 2: Delete PasswordResetTokens (no foreign key constraints)
    const deletedResetTokens = await prisma.passwordResetToken.deleteMany({})
    console.log(`🗑️  Deleted ${deletedResetTokens.count} password reset token(s)`)

    // Step 3: Delete VerificationTokens (no foreign key constraints)
    const deletedVerificationTokens = await prisma.verificationToken.deleteMany({})
    console.log(`🗑️  Deleted ${deletedVerificationTokens.count} verification token(s)`)

    // Step 4: Get all Tenants (these are linked to regular users)
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true,
        testrides: true,
      }
    })
    
    console.log(`\n📊 Found ${tenants.length} tenant(s) to delete:`)
    tenants.forEach(tenant => {
      console.log(`   - ${tenant.name} (${tenant.email})`)
      console.log(`     Users: ${tenant.users.length}, Testrides: ${tenant.testrides.length}`)
    })

    // Step 5: Delete all Testrides (linked to tenants)
    const deletedTestrides = await prisma.testride.deleteMany({})
    console.log(`\n🗑️  Deleted ${deletedTestrides.count} testride(s)`)

    // Step 6: Delete all DealerPlates (linked to tenants)
    const deletedPlates = await prisma.dealerPlate.deleteMany({})
    console.log(`🗑️  Deleted ${deletedPlates.count} dealer plate(s)`)

    // Step 7: Delete all Users (linked to tenants)
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`🗑️  Deleted ${deletedUsers.count} user(s)`)

    // Step 8: Delete all Tenants
    const deletedTenants = await prisma.tenant.deleteMany({})
    console.log(`🗑️  Deleted ${deletedTenants.count} tenant(s)`)

    console.log('\n✅ Cleanup completed successfully!')
    console.log('\n💡 You can now register again with any email address.')
    console.log('\n🔒 SuperAdmins remain intact:')
    superAdmins.forEach(admin => {
      console.log(`   ✓ ${admin.name} (${admin.email})`)
    })
    console.log('')

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupTestAccounts()

