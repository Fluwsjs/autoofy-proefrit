/**
 * Script om een IP-adres te deblokkeren van rate limiting
 * 
 * Gebruik:
 *   node scripts/unblock-ip.js <IP_ADRES>
 *   node scripts/unblock-ip.js 192.168.1.1
 *   node scripts/unblock-ip.js --all          (wis alle blocks)
 *   node scripts/unblock-ip.js --list         (toon alle geblokkeerde IPs)
 * 
 * Let op: Dit werkt alleen op de lokale development server!
 * Voor productie moet je de admin API gebruiken.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('❌ Gebruik: node scripts/unblock-ip.js <IP_ADRES>')
    console.log('')
    console.log('Opties:')
    console.log('  <IP_ADRES>   - Deblokkeer specifiek IP')
    console.log('  --list       - Toon alle geblokkeerde entries')
    console.log('  --all        - Wis alle rate limits')
    console.log('')
    console.log('Voorbeeld:')
    console.log('  node scripts/unblock-ip.js 192.168.1.100')
    process.exit(1)
  }

  const command = args[0]

  try {
    if (command === '--list') {
      console.log('📋 Ophalen van geblokkeerde entries...')
      const response = await fetch(`${BASE_URL}/api/admin/rate-limit`, {
        headers: {
          'Cookie': 'Voeg je session cookie toe voor auth',
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        console.log('❌ Error:', data.error || 'Kon data niet ophalen')
        console.log('')
        console.log('💡 Tip: Voor productie, gebruik de admin interface of curl met je sessie cookie')
        return
      }
      
      if (data.count === 0) {
        console.log('✅ Geen geblokkeerde IP\'s of emails gevonden!')
      } else {
        console.log(`📊 ${data.count} geblokkeerde entries:`)
        console.log('')
        data.entries.forEach((entry, i) => {
          console.log(`${i + 1}. ${entry.key}`)
          console.log(`   Pogingen: ${entry.count}`)
          console.log(`   Nog ${entry.remainingSeconds} seconden geblokkeerd`)
          console.log('')
        })
      }
    } else if (command === '--all') {
      console.log('🗑️  Wissen van alle rate limits...')
      console.log('')
      console.log('⚠️  LET OP: Dit is alleen bedoeld voor development!')
      console.log('   In productie kan dit de beveiliging verzwakken.')
      console.log('')
      console.log('Gebruik de admin API in productie:')
      console.log(`  curl -X DELETE "${BASE_URL}/api/admin/rate-limit" -H "Cookie: <session>"`)
    } else {
      const ip = command
      console.log(`🔓 Deblokkeren van IP: ${ip}`)
      console.log('')
      console.log('Gebruik de admin API:')
      console.log(`  curl -X POST "${BASE_URL}/api/admin/rate-limit" \\`)
      console.log(`       -H "Content-Type: application/json" \\`)
      console.log(`       -H "Cookie: <session_cookie>" \\`)
      console.log(`       -d '{"ip": "${ip}"}'`)
      console.log('')
      console.log('Of gebruik de admin interface op /admin')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

main()

