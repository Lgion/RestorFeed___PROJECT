const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting chat seeding...');

  // Récupérer tous les utilisateurs
  const users = await prisma.user.findMany();
  
  if (users.length < 2) {
    console.log('❌ Need at least 2 users to create conversations. Run seed-users.js first.');
    return;
  }

  // 1. Créer une conversation générale avec tous les utilisateurs non-publics
  const nonPublicUsers = users.filter(u => u.role !== 'public');
  
  try {
    const generalConv = await prisma.conversation.findFirst({
      where: { type: 'general' }
    });

    if (!generalConv) {
      const conversation = await prisma.conversation.create({
        data: {
          name: 'General Chat',
          type: 'general',
          participants: {
            create: nonPublicUsers.map(user => ({
              userId: user.id
            }))
          }
        }
      });

      // Ajouter quelques messages de démo
      await prisma.message.createMany({
        data: [
          {
            content: '👋 Bienvenue dans le chat général de RestOrFeed !',
            conversationId: conversation.id,
            authorId: nonPublicUsers[0].id
          },
          {
            content: 'Super ! On peut enfin communiquer facilement entre équipes.',
            conversationId: conversation.id,
            authorId: nonPublicUsers[1]?.id || nonPublicUsers[0].id
          },
          {
            content: 'N\'hésitez pas à poser vos questions ici ou créer des conversations privées.',
            conversationId: conversation.id,
            authorId: nonPublicUsers[0].id
          }
        ]
      });

      console.log('✅ Created general conversation with demo messages');
    } else {
      console.log('⚠️  General conversation already exists, skipping...');
    }

    // 2. Créer une conversation de support
    const supportConv = await prisma.conversation.findFirst({
      where: { type: 'support' }
    });

    if (!supportConv) {
      // Admins et managers pour le support
      const supportUsers = users.filter(u => ['admin', 'manager'].includes(u.role));
      
      if (supportUsers.length > 0) {
        const conversation = await prisma.conversation.create({
          data: {
            name: 'Support Technique',
            type: 'support',
            participants: {
              create: supportUsers.map(user => ({
                userId: user.id
              }))
            }
          }
        });

        await prisma.message.create({
          data: {
            content: '🆘 Canal de support technique - signalez ici les problèmes et bugs.',
            conversationId: conversation.id,
            authorId: supportUsers[0].id
          }
        });

        console.log('✅ Created support conversation');
      }
    } else {
      console.log('⚠️  Support conversation already exists, skipping...');
    }

    // 3. Créer une conversation privée d'exemple entre les 2 premiers utilisateurs
    if (nonPublicUsers.length >= 2) {
      const existingPrivate = await prisma.conversation.findFirst({
        where: {
          type: 'private',
          participants: {
            every: {
              userId: {
                in: [nonPublicUsers[0].id, nonPublicUsers[1].id]
              }
            }
          }
        }
      });

      if (!existingPrivate) {
        const conversation = await prisma.conversation.create({
          data: {
            type: 'private',
            participants: {
              create: [
                { userId: nonPublicUsers[0].id },
                { userId: nonPublicUsers[1].id }
              ]
            }
          }
        });

        await prisma.message.create({
          data: {
            content: 'Salut ! Comment ça se passe de ton côté ?',
            conversationId: conversation.id,
            authorId: nonPublicUsers[0].id
          }
        });

        console.log('✅ Created private conversation example');
      } else {
        console.log('⚠️  Private conversation already exists, skipping...');
      }
    }

  } catch (error) {
    console.error('❌ Error creating conversations:', error);
  }

  console.log('🎉 Chat seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Chat seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
