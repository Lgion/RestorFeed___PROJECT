import { getAuth } from '@clerk/nextjs/server';
import {prisma} from '../../lib/prismaClient';

export default async function handler(req, res) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Vérifier que l'utilisateur a les permissions (admin, manager, employee)
    let user = await prisma.user.findFirst({
      where: {
        clerkId: userId
      }
    });
    
    // Fallback: chercher par email si pas trouvé par clerkId
    if (!user) {
      // Récupérer l'email depuis Clerk
      const { getUser } = require('@clerk/nextjs/server');
      try {
        const clerkUser = await getUser(userId);
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (userEmail) {
          user = await prisma.user.findFirst({
            where: { email: userEmail }
          });
          
          // Mettre à jour le clerkId si utilisateur trouvé
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { clerkId: userId }
            });
          }
        }
      } catch (clerkError) {
        console.error('Error fetching user from Clerk:', clerkError);
      }
    }

    if (!user || user.role === 'public') {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }

    if (req.method === 'GET') {
      // Récupérer toutes les demandes d'aide actives
      const helpRequests = await prisma.helpRequest.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          resolver: {
            select: { id: true, username: true, email: true },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      res.status(200).json(helpRequests);
    } else if (req.method === 'PATCH') {
      // Mettre à jour le statut d'une demande d'aide
      const { id, status, resolvedBy } = req.body;
      
      const updateData = { status };
      if (status === 'RESOLVED' && resolvedBy) {
        updateData.resolvedBy = resolvedBy;
        updateData.resolvedAt = new Date();
      }

      const updatedRequest = await prisma.helpRequest.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          resolver: {
            select: { id: true, username: true, email: true },
          },
        },
      });

      res.status(200).json(updatedRequest);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling help requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
