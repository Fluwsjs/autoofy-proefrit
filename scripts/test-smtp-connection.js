const nodemailer = require('nodemailer')

async function testSMTP() {
  console.log('🧪 Testing SMTP Configuration...\n')
  
  // Load env vars (assuming dotenv is loaded or run with --env-file)
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'true'
  const from = process.env.FROM_EMAIL || user
  
  if (!host || !user || !pass) {
    console.log('❌ SMTP configuratie incompleet')
    console.log('   Vul SMTP_HOST, SMTP_USER en SMTP_PASS in')
    return
  }
  
  console.log(`Configuration:`)
  console.log(`- Host: ${host}`)
  console.log(`- Port: ${port}`)
  console.log(`- User: ${user}`)
  console.log(`- Secure: ${secure}`)
  console.log(`- From: ${from}`)
  
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  })
  
  try {
    console.log('\nVerifying connection...')
    await transporter.verify()
    console.log('✅ SMTP Connection successful!')
    
    // Ask for target email if run interactively, or skip sending
    console.log('\nOm een test email te sturen, voer dit script uit en pas de code aan met een target email.')
    
  } catch (error) {
    console.error('❌ SMTP Connection failed:', error.message)
  }
}

testSMTP()

