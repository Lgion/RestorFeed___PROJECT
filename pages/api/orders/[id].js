import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const id = parseInt(req.query.id);
  if (req.method === 'GET') {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(order);
  } else if (req.method === 'PUT') {
    const { status, isArchived } = req.body;
    let data = {};
    if (typeof status !== 'undefined') data.status = status;
    if (typeof isArchived !== 'undefined') data.isArchived = isArchived;
    const order = await prisma.order.update({ where: { id }, data });
    res.status(200).json(order);
  } else if (req.method === 'DELETE') {
    // Check admin role from header
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      console.warn('[API] Suppression refusée: x-user-role reçu =', userRole);
      return res.status(403).json({ error: 'Seuls les admins peuvent supprimer une commande.' });
    }
    // Delete OrderItems first due to FK constraint
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
