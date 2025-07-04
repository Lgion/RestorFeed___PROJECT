// Script pour tester le système de code couleur des timestamps
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestOrders() {
  console.log('🧪 Création de commandes de test avec différents âges');
  console.log('================================================\n');

  const now = new Date();
  
  // Créer des commandes avec différents âges
  const testOrders = [
    {
      table: '1',
      status: 'En cours',
      createdAt: new Date(now.getTime() - 1 * 60 * 1000), // 1 minute ago
      client: 'Test Client 1'
    },
    {
      table: '2', 
      status: 'En cours',
      createdAt: new Date(now.getTime() - 3 * 60 * 1000), // 3 minutes ago
      client: 'Test Client 2'
    },
    {
      table: '3',
      status: 'En cours', 
      createdAt: new Date(now.getTime() - 7 * 60 * 1000), // 7 minutes ago
      client: 'Test Client 3'
    },
    {
      table: '4',
      status: 'En cours',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      client: 'Test Client 4'
    },
    {
      table: '5',
      status: 'En cours',
      createdAt: new Date(now.getTime() - 25 * 60 * 1000), // 25 minutes ago
      client: 'Test Client 5'
    }
  ];

  try {
    // Supprimer les anciennes commandes de test
    await prisma.order.deleteMany({
      where: {
        table: {
          in: ['1', '2', '3', '4', '5']
        }
      }
    });

    // Créer les nouvelles commandes
    for (const orderData of testOrders) {
      const order = await prisma.order.create({
        data: orderData
      });
      
      const ageInMinutes = Math.round((now.getTime() - new Date(orderData.createdAt).getTime()) / 60000);
      let colorCode = '';
      
      if (ageInMinutes <= 2) colorCode = '🟢 VERT (Très récent)';
      else if (ageInMinutes <= 5) colorCode = '🟡 JAUNE (Récent)';
      else if (ageInMinutes <= 10) colorCode = '🔵 BLEU (Commence à dater)';
      else if (ageInMinutes <= 20) colorCode = '🟠 ORANGE (Prend du temps)';
      else colorCode = '🔴 ROUGE (Très ancien)';
      
      console.log(`✅ Commande créée - Table ${order.table} | ${ageInMinutes}min | ${colorCode}`);
    }

    console.log('\n🎨 Système de code couleur:');
    console.log('🟢 0-2 min   : Très récent');
    console.log('🟡 2-5 min   : Récent');
    console.log('🔵 5-10 min  : Commence à dater');
    console.log('🟠 10-20 min : Prend du temps');
    console.log('🔴 20+ min   : Très ancien');

    console.log('\n💡 Pour tester:');
    console.log('1. Redémarrez votre serveur: npm run dev');
    console.log('2. Allez sur une page avec le panier');
    console.log('3. Ouvrez le panier hover pour voir les couleurs');

  } catch (error) {
    console.error('❌ Erreur lors de la création des commandes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour afficher les commandes existantes avec leur âge
async function showExistingOrders() {
  console.log('\n📋 Commandes existantes:');
  console.log('========================');

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (orders.length === 0) {
      console.log('Aucune commande trouvée');
      return;
    }

    const now = new Date();
    
    orders.forEach((order, index) => {
      const ageInMinutes = Math.round((now.getTime() - new Date(order.createdAt).getTime()) / 60000);
      let colorCode = '';
      
      if (ageInMinutes <= 2) colorCode = '🟢';
      else if (ageInMinutes <= 5) colorCode = '🟡';
      else if (ageInMinutes <= 10) colorCode = '🔵';
      else if (ageInMinutes <= 20) colorCode = '🟠';
      else colorCode = '🔴';
      
      console.log(`${colorCode} Commande #${order.id} | Table ${order.table} | ${ageInMinutes}min | ${order.status}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--show')) {
    await showExistingOrders();
  } else {
    await createTestOrders();
    await showExistingOrders();
  }
}

main();
