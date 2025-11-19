const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification Flow...\n')
  
  try {
    // Step 1: Check environment variables
    console.log('1. Checking environment variables...')
    const resendKey = process.env.RESEND_API_KEY
    const resendEmail = process.env.RESEND_FROM_EMAIL
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const nextauthUrl = process.env.NEXTAUTH_URL
    
    const emailServiceConfigured = (resendKey && resendEmail) || (smtpHost && smtpUser)

    if (resendKey) {
      console.log('✅ RESEND_API_KEY is ingesteld')
    }
    
    if (smtpHost) {
      console.log('✅ SMTP_HOST is ingesteld')
    }

    if (!emailServiceConfigured) {
      console.log('❌ Geen email service geconfigureerd (Resend of SMTP)')
    }
    
    if (!nextauthUrl) {
      console.log('⚠️  NEXTAUTH_URL is niet ingesteld (gebruikt default)')
    } else {
      console.log('✅ NEXTAUTH_URL is ingesteld')
      console.log(`   URL: ${nextauthUrl}`)
    }
    
    console.log('')
    
    // Step 2: Test database connection
    console.log('2. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database verbinding succesvol\n')
    
    // Step 3: Check if VerificationToken model exists
    console.log('3. Checking database schema...')
    try {
      const tokenCount = await prisma.verificationToken.count()
      console.log('✅ VerificationToken tabel bestaat')
      console.log(`   Aantal tokens in database: ${tokenCount}`)
    } catch (error) {
      console.log('❌ VerificationToken tabel bestaat niet of heeft problemen')
      console.log(`   Error: ${error.message}`)
    }
    
    // Check User model
    try {
      const userCount = await prisma.user.count()
      console.log('✅ User tabel bestaat')
      console.log(`   Aantal users in database: ${userCount}`)
    } catch (error) {
      console.log('❌ User tabel bestaat niet of heeft problemen')
      console.log(`   Error: ${error.message}`)
    }
    
    console.log('')
    
    // Step 4: Check for unverified users
    console.log('4. Checking for unverified users...')
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    if (unverifiedUsers.length > 0) {
      console.log(`⚠️  Er zijn ${unverifiedUsers.length} niet-geverifieerde gebruikers:`)
      unverifiedUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - aangemaakt: ${user.createdAt.toLocaleString('nl-NL')}`)
      })
    } else {
      console.log('✅ Geen niet-geverifieerde gebruikers gevonden')
    }
    
    console.log('')
    
    // Step 5: Check for expired verification tokens
    console.log('5. Checking for expired verification tokens...')
    const expiredTokens = await prisma.verificationToken.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true
          }
        }
      }
    })
    
    if (expiredTokens.length > 0) {
      console.log(`⚠️  Er zijn ${expiredTokens.length} verlopen verificatie tokens:`)
      expiredTokens.forEach(token => {
        console.log(`   - Token voor ${token.user.email} (verlopen: ${token.expiresAt.toLocaleString('nl-NL')})`)
        console.log(`     User geverifieerd: ${token.user.emailVerified ? 'Ja' : 'Nee'}`)
      })
    } else {
      console.log('✅ Geen verlopen tokens gevonden')
    }
    
    console.log('')
    
    // Step 6: Check for active verification tokens
    console.log('6. Checking for active verification tokens...')
    const activeTokens = await prisma.verificationToken.findMany({
      where: {
        expiresAt: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true
          }
        }
      }
    })
    
    if (activeTokens.length > 0) {
      console.log(`✅ Er zijn ${activeTokens.length} actieve verificatie tokens:`)
      activeTokens.forEach(token => {
        const expiresIn = Math.round((token.expiresAt - new Date()) / (1000 * 60 * 60))
        console.log(`   - Token voor ${token.user.email}`)
        console.log(`     Verloopt over: ${expiresIn} uur`)
        console.log(`     User geverifieerd: ${token.user.emailVerified ? 'Ja' : 'Nee'}`)
      })
    } else {
      console.log('ℹ️  Geen actieve verificatie tokens gevonden')
    }
    
    console.log('')
    
    // Summary
    console.log('📊 Samenvatting:')
    console.log(`   - Email service geconfigureerd: ${emailServiceConfigured ? '✅' : '❌'}`)
    console.log(`   - Database verbinding: ✅`)
    console.log(`   - Schema correct: ✅`)
    console.log(`   - Niet-geverifieerde users: ${unverifiedUsers.length}`)
    console.log(`   - Actieve tokens: ${activeTokens.length}`)
    console.log(`   - Verlopen tokens: ${expiredTokens.length}`)
    
    if (!emailServiceConfigured) {
      console.log('\n⚠️  WAARSCHUWING: Geen e-mail service geconfigureerd!')
      console.log('   Stel RESEND_API_KEY in voor Resend')
      console.log('   OF stel SMTP_HOST, SMTP_USER, SMTP_PASS in voor eigen mailserver')
    } else {
      console.log('\n✅ Email verificatie systeem is klaar voor gebruik!')
    }
    
  } catch (error) {
    console.error('\n❌ Error tijdens test:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testEmailVerification()
