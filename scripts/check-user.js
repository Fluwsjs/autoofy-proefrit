const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const email = process.argv[2] || 'jordy.vhr@gmail.com';
  
  console.log(`\n🔍 Zoeken naar gebruiker: ${email}\n`);
  
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      isActive: true,
      password: true,
      createdAt: true,
      tenant: {
        select: { name: true }
      }
    }
  });
  
  if (user) {
    console.log('✅ Gebruiker gevonden:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Naam:', user.name);
    console.log('   Bedrijf:', user.tenant?.name);
    console.log('   Email Verified:', user.emailVerified ? '✅ JA' : '❌ NEE');
    console.log('   Is Active:', user.isActive ? '✅ JA' : '❌ NEE');
    console.log('   Password hash:', user.password ? user.password.substring(0, 25) + '...' : '❌ GEEN WACHTWOORD');
    console.log('   Aangemaakt:', user.createdAt);
    
    if (!user.emailVerified) {
      console.log('\n⚠️  PROBLEEM: Email is niet geverifieerd!');
    }
    if (!user.isActive) {
      console.log('\n⚠️  PROBLEEM: Account is gedeactiveerd!');
    }
    if (!user.password) {
      console.log('\n⚠️  PROBLEEM: Geen wachtwoord ingesteld!');
    }
  } else {
    console.log('❌ Gebruiker NIET gevonden met email:', email);
    
    // Check for similar emails
    const similarUsers = await prisma.user.findMany({
      where: {
        email: { contains: email.split('@')[0] }
      },
      select: { email: true }
    });
    
    if (similarUsers.length > 0) {
      console.log('\n📧 Vergelijkbare emails gevonden:');
      similarUsers.forEach(u => console.log('   -', u.email));
    }
  }
  
  await prisma.$disconnect();
}

checkUser().catch(e => {
  console.error('Error:', e);
  prisma.$disconnect();
});

