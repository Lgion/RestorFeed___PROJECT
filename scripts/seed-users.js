const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Créer quelques utilisateurs de test
  const users = [
    {
      email: 'admin@restorfeed.com',
      clerkId: 'clerk_test_admin',
      username: 'admin',
      role: 'admin'
    },
    {
      email: 'manager@restorfeed.com',
      clerkId: 'clerk_test_manager',
      username: 'manager',
      role: 'manager'
    },
    {
      email: 'waiter1@restorfeed.com',
      clerkId: 'clerk_test_waiter1',
      username: 'waiter1',
      role: 'employee'
    },
    {
      email: 'waiter2@restorfeed.com',
      clerkId: 'clerk_test_waiter2',
      username: 'waiter2',
      role: 'employee'
    },
    {
      email: 'chef@restorfeed.com',
      clerkId: 'clerk_test_chef',
      username: 'chef',
      role: 'employee'
    }
  ];

  console.log('🌱 Starting user seeding...');

  for (const userData of users) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: userData
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  console.log('🎉 User seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
