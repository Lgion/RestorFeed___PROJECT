// Script pour tester l'API help-request avec des données similaires à celles du frontend
const fetch = require('node-fetch');

async function testHurryUpAPI() {
  console.log('🧪 Test de l\'API Hurry Up via HTTP');
  console.log('==================================\n');

  const testData = {
    tableId: '6',
    orderId: 33, // Nombre comme dans l'erreur originale
    type: 'HURRY_UP',
    message: '🚀 URGENT: Accélérer la commande ##1 - Table 6',
    priority: 'URGENT'
  };

  console.log('Données envoyées:', testData);

  try {
    const response = await fetch('http://localhost:3000/api/help-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    console.log('Status:', response.status);
    
    const result = await response.json();
    console.log('Réponse:', result);

    if (response.ok) {
      console.log('✅ Test réussi ! Demande créée avec ID:', result.id);
    } else {
      console.log('❌ Test échoué:', result.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Vérifier si le serveur est en cours d'exécution
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/help-requests');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Serveur non accessible sur http://localhost:3000');
    console.log('💡 Assurez-vous que le serveur est démarré avec: npm run dev');
    return;
  }

  await testHurryUpAPI();
}

main();
