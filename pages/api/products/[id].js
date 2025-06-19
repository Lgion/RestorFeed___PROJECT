import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const id = parseInt(req.query.id);
  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(product);
  } else if (req.method === 'PUT') {
    const { name, description, price, image, customizable, status, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, image, customizable, status, category: { connect: { id: categoryId } } },
    });
    res.status(200).json(product);
  } else if (req.method === 'DELETE') {
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
