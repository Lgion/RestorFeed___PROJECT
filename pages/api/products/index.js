import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all products
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.status(200).json(products);
  } else if (req.method === 'POST') {
    // Create a product
    const { name, description, price, image, customizable, status, categoryId } = req.body;
    const product = await prisma.product.create({
      data: {
        name, description, price, image, customizable, status,
        category: { connect: { id: categoryId } }
      }
    });
    res.status(201).json(product);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
