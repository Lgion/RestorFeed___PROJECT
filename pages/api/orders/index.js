import { PrismaClient } from '@prisma/client';
import { selectAvailableServer } from '../../../lib/serverAssignment';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all orders (with items and products, and not yet archived)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Début de la journée
      
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: today,
          },
          isArchived: false,
        },
        include: { 
          items: { include: { product: true } },
          server: { // Inclure les informations du serveur
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
      console.log("\n\n\n\n\n");
      console.log(orders);
      console.log("kljikjjjjjjjjjjjjjjjjjj");
      
      
      
      
      if(!orders.length)
        await prisma.order.updateMany({
          where: {
            createdAt: {
              lt: today,
            },
            isArchived: false,
          },
          data: {
            isArchived: true,
          },
        });

      res.status(200).json(orders);
    } catch (error) {
      console.error('Error in GET /api/orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      // Create new order with server assignment
      const { items, client, table, status } = req.body;
      
      // Sélectionner le serveur disponible
      const server = await selectAvailableServer();
      if (!server) {
        return res.status(400).json({ error: 'Aucun serveur disponible pour prendre cette commande' });
      }

      const order = await prisma.order.create({
        data: {
          client,
          table,
          status,
          serverId: server.id,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          }
        },
        include: { 
          items: { include: { product: true } },
          server: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      // Mettre à jour la disponibilité du serveur
      await prisma.employee.update({
        where: { id: server.id },
        data: {
          availability: 'Busy'
        }
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Error in POST /api/orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
