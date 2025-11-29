/**
 * Test Authentication Flow Script
 * 
 * Dit script test de hele registratie en login flow
 * 
 * Run: node scripts/test-auth-flow.js
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAuthFlow() {
  console.log('\n🔍 Testing Authentication Flow...\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const checks = []

  // 1. Check Environment Variables
  console.log('1️⃣ Checking Environment Variables...')
  
  const nextAuthUrl = process.env.NEXTAUTH_URL
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const resendApiKey = process.env.RESEND_API_KEY
  const resendFromEmail = process.env.RESEND_FROM_EMAIL
  const databaseUrl = process.env.DATABASE_URL

  if (!nextAuthUrl) {
    checks.push({ name: 'NEXTAUTH_URL', status: '❌', message: 'NOT SET' })
  } else if (nextAuthUrl.endsWith('/')) {
    checks.push({ name: 'NEXTAUTH_URL', status: '⚠️', message: 'Has trailing slash' })
  } else if (!nextAuthUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
    checks.push({ name: 'NEXTAUTH_URL', status: '⚠️', message: 'Should use HTTPS in production' })
  } else {
    checks.push({ name: 'NEXTAUTH_URL', status: '✅', message: nextAuthUrl })
  }

  if (!nextAuthSecret || nextAuthSecret.length < 32) {
    checks.push({ name: 'NEXTAUTH_SECRET', status: '❌', message: 'Too short or not set' })
  } else {
    checks.push({ name: 'NEXTAUTH_SECRET', status: '✅', message: `${nextAuthSecret.substring(0, 5)}... (${nextAuthSecret.length} chars)` })
  }

  if (!resendApiKey) {
    checks.push({ name: 'RESEND_API_KEY', status: '⚠️', message: 'NOT SET - emails will not work' })
  } else {
    checks.push({ name: 'RESEND_API_KEY', status: '✅', message: `${resendApiKey.substring(0, 10)}...` })
  }

  if (!resendFromEmail) {
    checks.push({ name: 'RESEND_FROM_EMAIL', status: '⚠️', message: 'NOT SET' })
  } else {
    checks.push({ name: 'RESEND_FROM_EMAIL', status: '✅', message: resendFromEmail })
  }

  if (!databaseUrl) {
    checks.push({ name: 'DATABASE_URL', status: '❌', message: 'NOT SET' })
  } else {
    checks.push({ name: 'DATABASE_URL', status: '✅', message: 'postgresql://...' })
  }

  checks.forEach(check => {
    console.log(`   ${check.status} ${check.name}: ${check.message}`)
  })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 2. Check Database Connection
  console.log('2️⃣ Checking Database Connection...')
  try {
    await prisma.$connect()
    console.log('   ✅ Database connection successful\n')
  } catch (error) {
    console.log('   ❌ Database connection FAILED')
    console.log('   Error:', error.message)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 3. Check Database Schema
  console.log('3️⃣ Checking Database Schema...')
  try {
    // Check if User table exists and has required fields
    const userCount = await prisma.user.count()
    console.log(`   ✅ User table exists (${userCount} users)`)

    // Check if VerificationToken table exists
    const tokenCount = await prisma.verificationToken.count()
    console.log(`   ✅ VerificationToken table exists (${tokenCount} tokens)`)

    // Check if Tenant table exists
    const tenantCount = await prisma.tenant.count()
    console.log(`   ✅ Tenant table exists (${tenantCount} tenants)`)

    console.log('\n')
  } catch (error) {
    console.log('   ❌ Database schema incomplete or outdated')
    console.log('   Error:', error.message)
    console.log('   💡 Run: npx prisma db push\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 4. Check for unverified users
  console.log('4️⃣ Checking User Verification Status...')
  try {
    const unverifiedUsers = await prisma.user.findMany({
      where: { emailVerified: false },
      select: {
        email: true,
        name: true,
        createdAt: true,
      },
      take: 5,
    })

    if (unverifiedUsers.length === 0) {
      console.log('   ✅ No unverified users\n')
    } else {
      console.log(`   ⚠️  Found ${unverifiedUsers.length} unverified users:`)
      unverifiedUsers.forEach(user => {
        console.log(`      - ${user.email} (${user.name}) - Created: ${user.createdAt.toLocaleDateString()}`)
      })
      console.log('')
    }
  } catch (error) {
    console.log('   ❌ Error checking users')
    console.log('   Error:', error.message)
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 5. Check for expired tokens
  console.log('5️⃣ Checking Verification Tokens...')
  try {
    const now = new Date()
    const expiredTokens = await prisma.verificationToken.count({
      where: { expiresAt: { lt: now } }
    })
    const validTokens = await prisma.verificationToken.count({
      where: { expiresAt: { gte: now } }
    })

    console.log(`   ✅ Active tokens: ${validTokens}`)
    if (expiredTokens > 0) {
      console.log(`   ⚠️  Expired tokens: ${expiredTokens} (should be cleaned up)`)
    }
    console.log('')
  } catch (error) {
    console.log('   ❌ Error checking tokens')
    console.log('   Error:', error.message)
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 6. Summary
  console.log('📊 SUMMARY\n')

  const errors = checks.filter(c => c.status === '❌').length
  const warnings = checks.filter(c => c.status === '⚠️').length

  if (errors > 0) {
    console.log(`❌ ${errors} CRITICAL ISSUES found!`)
    console.log('   Authentication will NOT work until fixed.\n')
  } else if (warnings > 0) {
    console.log(`⚠️  ${warnings} warnings found.`)
    console.log('   App may work but some features might not function correctly.\n')
  } else {
    console.log('✅ All checks passed!')
    console.log('   Authentication flow should work correctly.\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 7. Next steps
  console.log('📝 NEXT STEPS\n')
  console.log('1. If you made changes to .env, restart your dev server')
  console.log('2. Test registration flow:')
  console.log('   - Go to your site')
  console.log('   - Register a new account with a REAL email')
  console.log('   - Check your inbox for verification email')
  console.log('   - Click the link in the email')
  console.log('   - Should auto-login to dashboard\n')
  console.log('3. If auto-login fails, try manual login with:')
  console.log('   - Email and password you just registered\n')
  console.log('4. Check Netlify/server logs if deployed\n')

  await prisma.$disconnect()
}

// Run the tests
testAuthFlow().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
