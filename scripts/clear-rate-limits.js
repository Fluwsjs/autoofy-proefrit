/**
 * Clear Rate Limit Cache Script
 * 
 * Dit script clearat de in-memory rate limit cache.
 * Dit is handig tijdens development/testing wanneer je de rate limit hebt bereikt.
 * 
 * BELANGRIJK: Dit werkt alleen als je het script runt in dezelfde process als de server!
 * Voor productie met meerdere instances, zou je Redis moeten gebruiken.
 * 
 * Voor nu: Herstart gewoon je development server om de cache te clearen.
 * 
 * Run: node scripts/clear-rate-limits.js
 */

console.log('\n🔄 Rate Limit Cache Clearer\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('ℹ️  De rate limit cache is in-memory (in het Node.js process).\n')
console.log('💡 Om de rate limit te resetten, kies één van deze opties:\n')

console.log('📋 OPTIE 1: Herstart Development Server (Aanbevolen)')
console.log('   1. Stop je server (Ctrl+C)')
console.log('   2. Start opnieuw: npm run dev')
console.log('   3. Cache is automatisch gecleared!\n')

console.log('📋 OPTIE 2: Wacht tot rate limit window verloopt')
console.log('   - Registratie rate limit: 1 uur')
console.log('   - Login rate limit: 15 minuten')
console.log('   - Email verificatie rate limit: 1 uur\n')

console.log('📋 OPTIE 3: Gebruik een ander IP adres / Browser')
console.log('   - Open incognito mode')
console.log('   - Gebruik een ander netwerk (mobiele hotspot)')
console.log('   - Clear cookies en probeer opnieuw\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('⚙️  CURRENT RATE LIMITS:\n')
console.log('   📝 Registratie: 10 pogingen per uur')
console.log('   🔐 Login: 5 pogingen per 15 minuten')
console.log('   📧 Email verificatie: 10 pogingen per uur')
console.log('   🔑 Password reset: 3 pogingen per uur\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('🚀 Voor productie met meerdere servers:')
console.log('   Overweeg om Redis-based rate limiting te implementeren.')
console.log('   Bijvoorbeeld: @upstash/ratelimit met Upstash Redis\n')

