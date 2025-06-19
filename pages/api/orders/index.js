import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all orders (with items and products)
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } }
    });
    res.status(200).json(orders);
  } else if (req.method === 'POST') {
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
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
