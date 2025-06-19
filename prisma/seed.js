// Prisma seed script for RestOrFeed
// Run with: npx prisma db seed

const { PrismaClient } = require('@prisma/client');
const { products } = require('../data/products');

const prisma = new PrismaClient();

// Extract unique categories from products
const categoriesMap = {};
products.forEach((p) => {
  if (!categoriesMap[p.category]) {
    categoriesMap[p.category] = {
      name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
      icon: null, // Ajoute les icônes si tu en as
    };
  }
});
const categories = Object.values(categoriesMap);

async function main() {
  // Upsert categories (inchangé)
  const catMap = {};
  for (const cat of categories) {
    const dbCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    catMap[cat.name.toLowerCase()] = dbCat;
  }

  // Supprime tous les produits avant d'insérer
  await prisma.product.deleteMany();

  // Crée les produits (sans id, Prisma gère)
  for (const prod of products) {
    await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        image: prod.image,
        customizable: prod.customizable,
        status: prod.status,
        category: {
          connect: { id: catMap[prod.category.toLowerCase()].id },
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
