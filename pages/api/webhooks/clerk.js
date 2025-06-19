// Clerk webhook handler: user.created → crée un User Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const event = req.body;
  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses, username } = event.data;
    const email = email_addresses && email_addresses[0]?.email_address;
    if (!clerkId || !email) return res.status(400).json({ error: 'Missing clerkId or email' });
    // Vérifie si l'utilisateur existe déjà
    const existing = await prisma.user.findUnique({ where: { clerkId } });
    if (existing) return res.status(200).json({ ok: true });
    // Crée l'utilisateur avec un rôle par défaut
    await prisma.user.create({
      data: {
        clerkId,
        email,
        username: username || null,
        role: 'user',
      }
    });
    return res.status(201).json({ ok: true });
  }
  return res.status(200).json({ ignored: true });
}

export const config = {
  api: {
    bodyParser: true,
  },
};
