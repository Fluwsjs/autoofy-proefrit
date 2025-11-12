const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    const admin = await prisma.superAdmin.findUnique({
      where: { email: "adminjvh@admin.local" }
    })
    
    if (admin) {
      console.log('✅ Admin account gevonden:')
      console.log(admin)
    } else {
      console.log('❌ Admin account niet gevonden')
    }
    
    const allAdmins = await prisma.superAdmin.findMany()
    console.log('\nAlle super admins:')
    console.log(allAdmins)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()

