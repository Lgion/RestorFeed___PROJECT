import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Récupérer toutes les conversations avec les derniers messages
      const conversations = await prisma.conversation.findMany({
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
          },
          _count: {
            select: { messages: true }
          }
        },
        where: {
          isActive: true
        },
        orderBy: { updatedAt: 'desc' }
      });
      
      res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Error fetching conversations' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, type, participantIds } = req.body;
      
      if (!type || !participantIds || !Array.isArray(participantIds)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Créer la conversation
      const conversation = await prisma.conversation.create({
        data: {
          name,
          type,
          participants: {
            create: participantIds.map(userId => ({
              userId: parseInt(userId)
            }))
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
          messages: true
        }
      });
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ error: 'Error creating conversation' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
