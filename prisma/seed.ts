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
  
  const sampleContracts = [
    {
      namakontrak: 'Kontrak Kerja Pak Budi',
      status: 'dihentikan',
      counterparty: 'PT Mulia Abadi',
      type: 'employment',
      jatuhtempo: new Date('2025-03-01')
    },
    {
      namakontrak: 'Kontrak Partnership ABC Corp',
      status: 'aktif',
      counterparty: 'ABC Corporation',
      type: 'partnership',
      jatuhtempo: new Date('2025-12-31')
    },
    {
      namakontrak: 'Kontrak Layanan IT Support',
      status: 'draft',
      counterparty: 'Tech Solutions',
      type: 'services',
      jatuhtempo: new Date('2024-12-31')
    },
    {
      namakontrak: 'Kontrak Konsultan Marketing',
      status: 'aktif',
      counterparty: 'Marketing Pro',
      type: 'consulting',
      jatuhtempo: new Date('2025-06-15')
    }
  ];

  for (const contract of sampleContracts) {
    await prisma.contract.create({
      data: contract
    });
  }

  console.log('✅ Sample contracts created!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })