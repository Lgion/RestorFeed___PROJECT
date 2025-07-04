const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testHurryUpFeature() {
  console.log('🧪 Test de la fonctionnalité Hurry Up!');
  console.log('=====================================\n');

  try {
    // 1. Vérifier que les nouveaux champs existent
    console.log('1. Vérification du schéma de base de données...');
    
    const helpRequestSchema = await prisma.$queryRaw`
      PRAGMA table_info(HelpRequest);
    `;
    
    const hasOrderId = helpRequestSchema.some(col => col.name === 'orderId');
    const hasType = helpRequestSchema.some(col => col.name === 'type');
    
    if (!hasOrderId || !hasType) {
      console.error('❌ Les champs orderId et/ou type sont manquants dans la table HelpRequest');
      console.log('Veuillez exécuter: npx prisma db push');
      return;
    }
    
    console.log('✅ Schéma de base de données OK');

    // 2. Créer une demande Hurry Up de test
    console.log('\n2. Création d\'une demande Hurry Up de test...');
    
    const testRequest = await prisma.helpRequest.create({
      data: {
        tableId: '5',
        orderId: 'test_order_123',
        type: 'HURRY_UP',
        message: '🚀 URGENT: Accélérer la commande #123 - Table 5',
        priority: 'URGENT',
        status: 'PENDING'
      }
    });
    
    console.log('✅ Demande Hurry Up créée:', {
      id: testRequest.id,
      type: testRequest.type,
      orderId: testRequest.orderId,
      priority: testRequest.priority
    });

    // 3. Récupérer toutes les demandes
    console.log('\n3. Récupération de toutes les demandes...');
    
    const allRequests = await prisma.helpRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`✅ ${allRequests.length} demandes trouvées`);
    allRequests.forEach(req => {
      console.log(`  - ID: ${req.id}, Type: ${req.type}, Priorité: ${req.priority}, Commande: ${req.orderId || 'N/A'}`);
    });

    // 4. Filtrer par type HURRY_UP
    console.log('\n4. Filtrage des demandes Hurry Up...');
    
    const hurryUpRequests = await prisma.helpRequest.findMany({
      where: { type: 'HURRY_UP' },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ ${hurryUpRequests.length} demandes Hurry Up trouvées`);

    // 5. Mettre à jour le statut
    console.log('\n5. Test de mise à jour du statut...');
    
    const updatedRequest = await prisma.helpRequest.update({
      where: { id: testRequest.id },
      data: { 
        status: 'IN_PROGRESS',
        resolvedBy: 1 // ID utilisateur fictif
      }
    });
    
    console.log('✅ Statut mis à jour:', updatedRequest.status);

    // 6. Statistiques par type
    console.log('\n6. Statistiques par type...');
    
    const stats = await prisma.helpRequest.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log('✅ Statistiques:');
    stats.forEach(stat => {
      console.log(`  - ${stat.type}: ${stat._count.type} demandes`);
    });

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Redémarrer votre serveur de développement');
    console.log('2. Tester le bouton Hurry Up dans l\'interface');
    console.log('3. Vérifier les notifications côté staff');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    if (error.code === 'P2002') {
      console.log('💡 Conseil: Il semble y avoir un conflit de données. Essayez de nettoyer la base.');
    } else if (error.message.includes('Unknown column')) {
      console.log('💡 Conseil: Exécutez "npx prisma db push" pour appliquer les migrations.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanup() {
  console.log('🧹 Nettoyage des données de test...');
  
  try {
    const deleted = await prisma.helpRequest.deleteMany({
      where: {
        OR: [
          { orderId: { startsWith: 'test_' } },
          { message: { contains: 'test' } }
        ]
      }
    });
    
    console.log(`✅ ${deleted.count} demandes de test supprimées`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
const args = process.argv.slice(2);
if (args.includes('--cleanup')) {
  cleanup();
} else {
  testHurryUpFeature();
}
