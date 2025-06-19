import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users (do NOT return passwords in prod)
    const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, createdAt: true } });
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    // Correction : body check et mapping Clerk
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid body' });
    }
    const { email, clerkId, username, role } = req.body;
    if (!email || !clerkId || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const user = await prisma.user.create({
        data: { email, clerkId, username, role }
      });
      res.status(201).json({
        id: user.id,
        email: user.email,
        clerkId: user.clerkId,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
