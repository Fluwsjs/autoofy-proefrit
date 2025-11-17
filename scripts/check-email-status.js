const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkEmailStatus() {
  try {
    const email = process.argv[2] || 'imfloes@gmail.com'
    
    console.log(`🔍 Checking email status for: ${email}\n`)
    
    // Check user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenant: true,
        emailVerificationToken: true
      }
    })
    
    if (!user) {
      console.log(`❌ Gebruiker met email ${email} niet gevonden`)
      return
    }
    
    console.log(`✅ Gebruiker gevonden:`)
    console.log(`   Naam: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`)
    console.log(`   Created: ${user.createdAt.toLocaleString('nl-NL')}`)
    console.log(`   Tenant: ${user.tenant.name}\n`)
    
    // Check verification token
    if (user.emailVerificationToken) {
      const token = user.emailVerificationToken
      const isExpired = token.expiresAt < new Date()
      const expiresIn = Math.round((token.expiresAt - new Date()) / (1000 * 60 * 60))
      
      console.log(`📧 Verification Token:`)
      console.log(`   Token: ${token.token.substring(0, 20)}...`)
      console.log(`   Expires: ${token.expiresAt.toLocaleString('nl-NL')}`)
      console.log(`   Status: ${isExpired ? '❌ Verlopen' : '✅ Actief'}`)
      if (!isExpired) {
        console.log(`   Verloopt over: ${expiresIn} uur`)
      }
      console.log(`   Created: ${token.createdAt.toLocaleString('nl-NL')}\n`)
    } else {
      console.log(`⚠️  Geen verificatie token gevonden\n`)
    }
    
    // Check environment variables
    console.log(`🔧 Environment Check:`)
    const resendKey = process.env.RESEND_API_KEY
    const resendEmail = process.env.RESEND_FROM_EMAIL
    const nextauthUrl = process.env.NEXTAUTH_URL
    
    console.log(`   RESEND_API_KEY: ${resendKey ? '✅ Set' : '❌ NOT SET'}`)
    console.log(`   RESEND_FROM_EMAIL: ${resendEmail || '❌ NOT SET'}`)
    console.log(`   NEXTAUTH_URL: ${nextauthUrl || '❌ NOT SET'}\n`)
    
    if (!user.emailVerified && user.emailVerificationToken) {
      const baseUrl = nextauthUrl || 'http://localhost:3000'
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${user.emailVerificationToken.token}`
      console.log(`🔗 Verification URL:`)
      console.log(`   ${verificationUrl}\n`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

checkEmailStatus()

