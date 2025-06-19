// API route: GET /api/users/clerk/[clerkId] → retourne le user Prisma par clerkId
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { clerkId } = req.query;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json(user);
}
