/**
 * Check Environment Variables Script
 * 
 * Dit script checkt of alle benodigde environment variabelen correct zijn ingesteld
 * en geeft waarschuwingen als er problemen zijn.
 * 
 * Run: node scripts/check-env.js
 */

// Load environment variables
require('dotenv').config()

console.log('\n🔍 Checking Environment Variables...\n')

const checks = []

// Check NEXTAUTH_URL
const nextAuthUrl = process.env.NEXTAUTH_URL
if (!nextAuthUrl) {
  checks.push({
    name: 'NEXTAUTH_URL',
    status: '❌',
    message: 'NIET INGESTELD! Dit is verplicht voor authenticatie.',
  })
} else {
  const isValid = nextAuthUrl.startsWith('http://') || nextAuthUrl.startsWith('https://')
  const hasTrailingSlash = nextAuthUrl.endsWith('/')
  const isProduction = nextAuthUrl.startsWith('https://')
  const expectedDomain = 'proefrit-autoofy.nl'
  const hasCorrectDomain = nextAuthUrl.includes(expectedDomain)

  if (!isValid) {
    checks.push({
      name: 'NEXTAUTH_URL',
      status: '❌',
      message: `Ongeldige URL: "${nextAuthUrl}". Moet beginnen met http:// of https://`,
      value: nextAuthUrl,
    })
  } else if (hasTrailingSlash) {
    checks.push({
      name: 'NEXTAUTH_URL',
      status: '⚠️',
      message: `Trailing slash gevonden! Verwijder de / aan het einde: "${nextAuthUrl}"`,
      value: nextAuthUrl,
    })
  } else if (isProduction && !hasCorrectDomain) {
    checks.push({
      name: 'NEXTAUTH_URL',
      status: '⚠️',
      message: `Verwacht domein "${expectedDomain}" maar gevonden: "${nextAuthUrl}"`,
      value: nextAuthUrl,
    })
  } else {
    checks.push({
      name: 'NEXTAUTH_URL',
      status: '✅',
      message: isProduction ? 'Productie URL correct ingesteld' : 'Development URL correct ingesteld',
      value: nextAuthUrl,
    })
  }
}

// Check NEXTAUTH_SECRET
const nextAuthSecret = process.env.NEXTAUTH_SECRET
if (!nextAuthSecret) {
  checks.push({
    name: 'NEXTAUTH_SECRET',
    status: '❌',
    message: 'NIET INGESTELD! Dit is verplicht voor authenticatie.',
  })
} else if (nextAuthSecret.length < 32) {
  checks.push({
    name: 'NEXTAUTH_SECRET',
    status: '⚠️',
    message: `Te kort (${nextAuthSecret.length} karakters). Minimaal 32 karakters aanbevolen.`,
    value: `${nextAuthSecret.substring(0, 5)}... (lengte: ${nextAuthSecret.length})`,
  })
} else {
  checks.push({
    name: 'NEXTAUTH_SECRET',
    status: '✅',
    message: 'Correct ingesteld',
    value: `${nextAuthSecret.substring(0, 5)}... (lengte: ${nextAuthSecret.length})`,
  })
}

// Check DATABASE_URL
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  checks.push({
    name: 'DATABASE_URL',
    status: '❌',
    message: 'NIET INGESTELD! Database connectie zal falen.',
  })
} else if (!databaseUrl.startsWith('postgresql://')) {
  checks.push({
    name: 'DATABASE_URL',
    status: '⚠️',
    message: 'Verwacht postgresql:// URL',
    value: databaseUrl.substring(0, 20) + '...',
  })
} else {
  checks.push({
    name: 'DATABASE_URL',
    status: '✅',
    message: 'PostgreSQL URL correct ingesteld',
    value: 'postgresql://...',
  })
}

// Check RESEND_API_KEY
const resendApiKey = process.env.RESEND_API_KEY
if (!resendApiKey) {
  checks.push({
    name: 'RESEND_API_KEY',
    status: '⚠️',
    message: 'Niet ingesteld. Email functionaliteit zal niet werken.',
  })
} else if (!resendApiKey.startsWith('re_')) {
  checks.push({
    name: 'RESEND_API_KEY',
    status: '⚠️',
    message: 'Ongeldige Resend API key (moet beginnen met "re_")',
    value: resendApiKey.substring(0, 10) + '...',
  })
} else {
  checks.push({
    name: 'RESEND_API_KEY',
    status: '✅',
    message: 'Correct ingesteld',
    value: resendApiKey.substring(0, 10) + '...',
  })
}

// Check RESEND_FROM_EMAIL
const resendFromEmail = process.env.RESEND_FROM_EMAIL
if (!resendFromEmail) {
  checks.push({
    name: 'RESEND_FROM_EMAIL',
    status: '⚠️',
    message: 'Niet ingesteld. Emails zullen niet verstuurd worden.',
  })
} else {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(resendFromEmail)) {
    checks.push({
      name: 'RESEND_FROM_EMAIL',
      status: '⚠️',
      message: 'Ongeldig email formaat',
      value: resendFromEmail,
    })
  } else {
    checks.push({
      name: 'RESEND_FROM_EMAIL',
      status: '✅',
      message: 'Correct ingesteld',
      value: resendFromEmail,
    })
  }
}

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development'
checks.push({
  name: 'NODE_ENV',
  status: 'ℹ️',
  message: `Running in ${nodeEnv} mode`,
  value: nodeEnv,
})

// Print results
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

checks.forEach((check) => {
  console.log(`${check.status} ${check.name}`)
  console.log(`   ${check.message}`)
  if (check.value) {
    console.log(`   Waarde: ${check.value}`)
  }
  console.log()
})

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Summary
const errors = checks.filter((c) => c.status === '❌').length
const warnings = checks.filter((c) => c.status === '⚠️').length
const success = checks.filter((c) => c.status === '✅').length

if (errors > 0) {
  console.log(`❌ ${errors} KRITIEKE PROBLEMEN gevonden!`)
  console.log('   Authenticatie zal NIET werken tot deze zijn opgelost.\n')
  process.exit(1)
} else if (warnings > 0) {
  console.log(`⚠️  ${warnings} waarschuwingen gevonden.`)
  console.log('   Applicatie kan werken maar sommige features mogelijk niet.\n')
  process.exit(0)
} else {
  console.log(`✅ Alle ${success} variabelen zijn correct ingesteld!`)
  console.log('   Applicatie zou normaal moeten werken.\n')
  process.exit(0)
}

