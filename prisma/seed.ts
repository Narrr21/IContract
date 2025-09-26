import { PrismaClient, UserCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Create dummy user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      firstname: 'Test',
      lastname: 'User',
      category: UserCategory.ADMIN,
      password: hashedPassword,
      profilepath: '/profiles/default.png',
    },
  })
  
  console.log('Created user:', user)
  
  // Create a dummy contract for testing
//   const contract = await prisma.contract.create({
//     data: {
//       title: 'Sample Contract',
//       content: 'This is a sample contract for testing purposes.',
//       type: 'service',
//       status: 'draft',
//       userId: user.id,
//     },
//   })
  
//   console.log('Created contract:', contract)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })