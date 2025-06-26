import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = req.query;
  const userIdInt = parseInt(userId);
  
  if (isNaN(userIdInt)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  if (req.method === 'GET') {
    try {
      // Récupérer toutes les conversations de cet utilisateur
      const conversations = await prisma.conversation.findMany({
        where: {
          isActive: true,
          participants: {
            some: {
              userId: userIdInt
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, username: true, email: true, role: true }
              }
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                select: { id: true, username: true, email: true }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
      
      // Calculer manuellement les messages non lus pour chaque conversation
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
          const participant = await prisma.conversationParticipant.findUnique({
            where: {
              conversationId_userId: {
                conversationId: conv.id,
                userId: userIdInt
              }
            }
          });
          
          const lastReadAt = participant?.lastReadAt || new Date(0);
          
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              createdAt: { gt: lastReadAt },
              authorId: { not: userIdInt }
            }
          });
          
          return {
            ...conv,
            unreadCount
          };
        })
      );
      
      res.status(200).json(conversationsWithUnread);
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      res.status(500).json({ error: 'Error fetching conversations', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
