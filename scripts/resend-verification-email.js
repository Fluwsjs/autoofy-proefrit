const { PrismaClient } = require('@prisma/client')
const { Resend } = require('resend')

const prisma = new PrismaClient()

async function resendVerificationEmail() {
  try {
    const email = process.argv[2]
    
    if (!email) {
      console.log('❌ Gebruik: node scripts/resend-verification-email.js <email>')
      console.log('   Voorbeeld: node scripts/resend-verification-email.js imfloes@gmail.com')
      return
    }
    
    console.log(`📧 Resending verification email to: ${email}\n`)
    
    // Check environment
    const resendKey = process.env.RESEND_API_KEY
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    if (!resendKey) {
      console.log('❌ RESEND_API_KEY is niet ingesteld in .env file')
      return
    }
    
    console.log(`✅ Resend configuratie:`)
    console.log(`   API Key: ${resendKey.substring(0, 10)}...`)
    console.log(`   From Email: ${resendFromEmail}`)
    console.log(`   Base URL: ${baseUrl}\n`)
    
    // Find user
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
    
    console.log(`✅ Gebruiker gevonden: ${user.name}`)
    console.log(`   Email Verified: ${user.emailVerified ? 'Ja' : 'Nee'}\n`)
    
    if (user.emailVerified) {
      console.log('⚠️  Gebruiker is al geverifieerd!')
      return
    }
    
    // Delete old token if exists
    if (user.emailVerificationToken) {
      await prisma.verificationToken.delete({
        where: { id: user.emailVerificationToken.id }
      })
      console.log('🗑️  Oude verificatie token verwijderd')
    }
    
    // Generate new token
    const crypto = require('crypto')
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })
    
    console.log(`✅ Nieuwe verificatie token aangemaakt`)
    console.log(`   Token: ${token.substring(0, 20)}...`)
    console.log(`   Verloopt: ${expiresAt.toLocaleString('nl-NL')}\n`)
    
    // Send email
    const resend = new Resend(resendKey)
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`
    
    console.log(`📤 Verzenden email...`)
    console.log(`   To: ${user.email}`)
    console.log(`   From: ${resendFromEmail}`)
    console.log(`   URL: ${verificationUrl}\n`)
    
    const { data, error } = await resend.emails.send({
      from: `Autoofy <${resendFromEmail}>`,
      to: [user.email],
      subject: 'Verifieer uw e-mailadres - Autoofy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 40px;">
            <h1 style="color: #1D3557; margin-bottom: 20px;">Welkom bij Autoofy, ${user.name}!</h1>
            <p style="color: #4b5563; line-height: 1.6;">
              Bedankt voor uw registratie. Om uw account te activeren, klik op de onderstaande knop:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background-color: #B22234; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Verifieer e-mailadres
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Als de knop niet werkt, kopieer en plak deze link in uw browser:<br>
              <a href="${verificationUrl}" style="color: #B22234; word-break: break-all;">${verificationUrl}</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              Deze link verloopt over 24 uur.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Welkom bij Autoofy, ${user.name}!\n\nBedankt voor uw registratie. Om uw account te activeren, klik op de volgende link:\n\n${verificationUrl}\n\nDeze link verloopt over 24 uur.`
    })
    
    if (error) {
      console.error('❌ Resend API Error:')
      console.error(JSON.stringify(error, null, 2))
      return
    }
    
    console.log('✅ Email succesvol verzonden!')
    console.log(`   Email ID: ${data?.id || 'N/A'}`)
    console.log(`\n📧 Check je inbox (en spam folder) op: ${user.email}`)
    console.log(`🔗 Of gebruik deze link direct:`)
    console.log(`   ${verificationUrl}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

resendVerificationEmail()

