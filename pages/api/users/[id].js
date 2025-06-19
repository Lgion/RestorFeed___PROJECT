import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const id = parseInt(req.query.id);
  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, username: true, role: true, createdAt: true } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(user);
  } else if (req.method === 'PUT') {
    const { username, password, role } = req.body;
    const user = await prisma.user.update({ where: { id }, data: { username, password, role } });
    res.status(200).json({ id: user.id, username: user.username, role: user.role, createdAt: user.createdAt });
  } else if (req.method === 'DELETE') {
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
