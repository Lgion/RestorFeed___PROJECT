import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const id = parseInt(req.query.id);
  if (req.method === 'GET') {
    const category = await prisma.category.findUnique({ where: { id }, include: { products: true } });
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(category);
  } else if (req.method === 'PUT') {
    const { name, icon } = req.body;
    const category = await prisma.category.update({ where: { id }, data: { name, icon } });
    res.status(200).json(category);
  } else if (req.method === 'DELETE') {
    await prisma.category.delete({ where: { id } });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
