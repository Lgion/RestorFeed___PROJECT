import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'PATCH') {
    try {
      const { conversationId, userId } = req.body;
      
      if (!conversationId || !userId) {
        return res.status(400).json({ error: 'Missing conversationId or userId' });
      }
      
      // Mettre à jour lastReadAt pour ce participant
      const participant = await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: parseInt(conversationId),
            userId: parseInt(userId)
          }
        },
        data: {
          lastReadAt: new Date()
        }
      });
      
      res.status(200).json({ success: true, participant });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ error: 'Error marking messages as read' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
