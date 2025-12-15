const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUserEmail() {
  const email = process.argv[2] || 'jordy.vhr@gmail.com';
  
  console.log(`\n🔧 Email verifiëren voor: ${email}\n`);
  
  const user = await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    }
  });
  
  console.log('✅ Email geverifieerd!');
  console.log('   Gebruiker:', user.name);
  console.log('   Email:', user.email);
  console.log('   Geverifieerd op:', user.emailVerifiedAt);
  console.log('\n🎉 Je kunt nu inloggen!');
  
  await prisma.$disconnect();
}

verifyUserEmail().catch(e => {
  console.error('Error:', e);
  prisma.$disconnect();
});

