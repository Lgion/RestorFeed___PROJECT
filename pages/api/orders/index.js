import { PrismaClient } from '@prisma/client';

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
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      });
      
      const todayOrders = orders.filter(order => order.createdAt >= today);
      // les commandes qui ne sont pas d'aujourd'hui sont archivées
      if(todayOrders.length)
        await prisma.order.updateMany({
          where: {
            createdAt: {
              lt: today,
            },
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
      // Create new order
      const { items, client, table, status } = req.body;
      const order = await prisma.order.create({
        data: {
          client,
          table,
          status,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          }
        },
        include: { items: true }
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
