import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const categories = await prisma.category.findMany({ include: { products: true } });
    res.status(200).json(categories);
  } else if (req.method === 'POST') {
    const { name, icon } = req.body;
    const category = await prisma.category.create({ data: { name, icon } });
    res.status(201).json(category);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
