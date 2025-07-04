import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { clerkId } = req.query;
  
  if (req.method === 'GET') {
    try {
      // Chercher d'abord par clerkId
      let user = await prisma.user.findFirst({ 
        where: { clerkId },
        select: { id: true, username: true, role: true, email: true, clerkId: true, createdAt: true }
      });
      
      // Si pas trouvé par clerkId, essayer de récupérer l'email depuis Clerk
      if (!user) {
        try {
          const { getUser } = require('@clerk/nextjs/server');
          const clerkUser = await getUser(clerkId);
          const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
          
          if (userEmail) {
            user = await prisma.user.findFirst({
              where: { email: userEmail },
              select: { id: true, username: true, role: true, email: true, clerkId: true, createdAt: true }
            });
            
            // Mettre à jour le clerkId si utilisateur trouvé
            if (user) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { clerkId },
                select: { id: true, username: true, role: true, email: true, clerkId: true, createdAt: true }
              });
            }
          }
        } catch (clerkError) {
          console.error('Error fetching user from Clerk:', clerkError);
        }
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error in by-clerk-id API:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
