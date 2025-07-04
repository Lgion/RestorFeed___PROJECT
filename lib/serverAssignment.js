import { prisma } from './prismaClient';

/**
 * Sélectionne le serveur disponible avec le moins de commandes en cours
 * @returns {Promise<Employee | null>} Le serveur sélectionné ou null si aucun n'est disponible
 */
export async function selectAvailableServer() {
  try {
    // Obtenir la date et l'heure actuelles
    const today = new Date();
    const currentHour = today.getHours();
    
    // Obtenir le jour de la semaine en anglais (format abrégé)
    const weekdayMap = {
      'sunday': 'Sun',
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat'
    };
    
    // Obtenir le jour actuel en minuscules pour la correspondance
    const currentDayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentDay = weekdayMap[currentDayName];
    
    console.log(`Jour actuel: ${currentDay} (${currentDayName})`);
    console.log('Jours disponibles:', Object.values(weekdayMap).join(', '));

    // Récupérer tous les serveurs actifs
    console.log("zooooooooooooooooooooooo");
    const servers = await prisma.employee.findMany({
      where: {
        role: 'Serveur',
        status: 'Active'
      },
      include: {
        orders: {
          where: {
            status: 'En cours'
          }
        }
      }
    });
    console.log(servers);
    
    console.log("ddooooooooooooooooooooooo");

    // Filtrer les serveurs disponibles actuellement
    const availableServers = servers.filter(server => {
      try {
        console.log(`\nVérification du serveur: ${server.name}`);
        console.log(`Schedule: "${server.schedule}"`);
        
        // Vérifier si le serveur a un horaire défini
        if (!server.schedule || typeof server.schedule !== 'string' || server.schedule.trim() === '') {
          console.log(`❌ ${server.name} ignoré: pas d'horaire défini`);
          return false;
        }

        // Extraire les jours et heures du schedule
        const scheduleParts = server.schedule.split(',');
        if (scheduleParts.length < 2) {
          console.log(`❌ ${server.name} ignoré: format d'horaire invalide (${server.schedule})`);
          return false;
        }

        const daysPart = scheduleParts[0].trim();
        const hoursPart = scheduleParts[1].trim();

        // Vérifier si le jour actuel est dans la plage
        const daysRange = daysPart.split('–');
        if (daysRange.length === 0) {
          console.log(`❌ ${server.name} ignoré: format de jours invalide (${daysPart})`);
          return false;
        }

        const startDay = daysRange[0].trim();
        const endDay = daysRange[1]?.trim() || startDay;
        
        // Liste des jours en ordre
        const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const startIndex = daysOrder.indexOf(startDay);
        const endIndex = daysOrder.indexOf(endDay);
        
        if (startIndex === -1 || endIndex === -1) {
          console.log(`❌ ${server.name} ignoré: jours invalides (${startDay} - ${endDay})`);
          return false;
        }
        
        // Afficher les jours de la plage pour le débogage
        console.log(`Plage de jours pour ${server.name}: ${startDay} à ${endDay}`);
        console.log(`Indices: ${startIndex} à ${endIndex}, jour actuel: ${currentDay}`);
        
        // Vérifier si le jour actuel est dans la plage
        let isDayInRange = false;
        const currentDayIndex = daysOrder.indexOf(currentDay);
        
        console.log(`Indice jour actuel (${currentDay}): ${currentDayIndex}`);
        
        if (startIndex <= endIndex) {
          // Plage normale (ex: Mon-Fri)
          isDayInRange = currentDayIndex >= startIndex && currentDayIndex <= endIndex;
          console.log(`Vérification plage normale: ${currentDayIndex} entre ${startIndex} et ${endIndex} -> ${isDayInRange}`);
        } else {
          // Cas où la plage traverse le week-end (ex: Fri-Mon)
          isDayInRange = currentDayIndex >= startIndex || currentDayIndex <= endIndex;
          console.log(`Vérification plage inversée: ${currentDayIndex} >= ${startIndex} OU <= ${endIndex} -> ${isDayInRange}`);
        }

        // Vérifier si l'heure actuelle est dans la plage
        const hoursRange = hoursPart.split('-');
        if (hoursRange.length < 2) {
          console.log(`❌ ${server.name} ignoré: format d'heures invalide (${hoursPart})`);
          return false;
        }

        // Convertir les heures en format 24h
        const parseHour = (timeStr) => {
          const [time, period] = timeStr.trim().split(' ');
          let [hours] = time.split(':').map(Number);
          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          return hours;
        };

        const startHour = parseHour(hoursRange[0]);
        const endHour = parseHour(hoursRange[1]);
        
        // Vérifier si l'heure actuelle est dans la plage
        const isHourInRange = currentHour >= startHour && currentHour < endHour;

        console.log(`✅ ${server.name} - Jour: ${isDayInRange}, Heure: ${isHourInRange} (${startHour}h-${endHour}h)`);
        return isDayInRange && isHourInRange;
      } catch (error) {
        console.error(`❌ Erreur lors du traitement du serveur ${server.name}:`, error);
        return false;
      }
    });
    console.log("aaaaaaaooooooooooooooooooooooo");
    console.log(availableServers);

    // Si aucun serveur n'est disponible
    if (availableServers.length === 0) {
      return null;
    }
    
    

    // Trouver le serveur avec le moins de commandes
    const serverWithFewestOrders = availableServers.reduce((minServer, currentServer) => {
      const currentOrderCount = currentServer.orders.length;
      const minOrderCount = minServer?.orders?.length || Infinity;
      return currentOrderCount < minOrderCount ? currentServer : minServer;
    });

    return serverWithFewestOrders;
  } catch (error) {
    console.error('Erreur lors de la sélection du serveur:', error);
    return null;
  }
}

/**
 * Vérifie si un serveur est disponible pour une nouvelle commande
 * @param {Employee} server - Le serveur à vérifier
 * @returns {boolean} True si le serveur est disponible, false sinon
 */
export async function isServerAvailable(server) {
  try {
    const currentOrders = await prisma.order.count({
      where: {
        serverId: server.id,
        status: 'En cours'
      }
    });

    // On pourrait ajouter une logique plus complexe ici pour définir le nombre maximum de commandes
    // Par exemple : return currentOrders < 5;
    return currentOrders < 5; // Limite arbitraire pour l'exemple
  } catch (error) {
    console.error('Erreur lors de la vérification de la disponibilité du serveur:', error);
    return false;
  }
}
