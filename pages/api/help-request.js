import { getAuth } from '@clerk/nextjs/server';
import {prisma} from '../../lib/prismaClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log(req.body);
    
    let { userId } = getAuth(req);
    userId = userId ? userId : "test_"+req.body.tableId;
    console.log(userId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let user = null;
    let actualUserId = null;
    
    // Si l'utilisateur n'est PAS un invité (pas de 'test_'), on le cherche dans la DB
    if (userId.indexOf('test_') === -1) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { clerkId: userId },
            { email: req.body.userEmail } // Fallback si pas de clerkId
          ]
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      actualUserId = user.id;
    }
    // Pour les invités (test_), on laisse actualUserId à null
    
    const { tableId, orderId, type = 'GENERAL', message = 'Aide demandée', priority = 'NORMAL' } = req.body;
    
    const requestData = {
      userId: actualUserId, // null pour invités, user.id pour connectés
      tableId: tableId ? tableId.toString() : null, // Garder comme string selon le schéma
      orderId: orderId ? orderId.toString() : null, // ID de la commande si fourni (toujours string)
      type: type || 'GENERAL', // Type de demande (GENERAL, HURRY_UP, etc.)
      message: message || 'Aide demandée',
      priority: priority || 'NORMAL',
      status: 'PENDING',
    };
    
    console.log('Creating help request with data:', requestData);
    
    // Enregistrer la demande d'aide dans la base de données
    const helpRequest = await prisma.helpRequest.create({
      data: requestData,
    });
    
    console.log('Help request created successfully:', helpRequest);

    // Ici, vous pourriez ajouter la logique pour émettre un événement WebSocket
    // Par exemple : io.emit('help-request', helpRequest);

    res.status(201).json(helpRequest);
  } catch (error) {
    console.error('Error creating help request:', error?.message || error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error?.message || 'Unknown error'
    });
  }
}
