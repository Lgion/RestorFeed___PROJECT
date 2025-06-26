import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { conversationId } = req.query;
  const convId = parseInt(conversationId);
  
  if (isNaN(convId)) {
    return res.status(400).json({ error: 'Invalid conversation ID' });
  }
  
  if (req.method === 'GET') {
    try {
      // Récupérer les messages d'une conversation
      const messages = await prisma.message.findMany({
        where: {
          conversationId: convId
        },
        include: {
          author: {
            select: { id: true, username: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });
      
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  } else if (req.method === 'POST') {
    try {
      const { content, authorId } = req.body;
      
      if (!content || !authorId) {
        return res.status(400).json({ error: 'Missing content or authorId' });
      }
      
      // Vérifier que l'utilisateur est participant de la conversation
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: convId,
            userId: parseInt(authorId)
          }
        }
      });
      
      if (!participant) {
        return res.status(403).json({ error: 'User is not a participant of this conversation' });
      }
      
      // Créer le message
      const message = await prisma.message.create({
        data: {
          content,
          conversationId: convId,
          authorId: parseInt(authorId)
        },
        include: {
          author: {
            select: { id: true, username: true, email: true, role: true }
          }
        }
      });
      
      // Mettre à jour le timestamp de la conversation
      await prisma.conversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() }
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Error creating message' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
