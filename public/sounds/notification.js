// Fonction pour jouer un son de notification simple
export function playNotificationSound() {
  try {
    // Créer un contexte audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Créer un oscillateur pour générer un son
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connecter les nœuds
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurer le son (fréquence et volume)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume à 30%
    
    // Jouer le son pendant 200ms
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
    
    // Nettoyer après utilisation
    setTimeout(() => {
      audioContext.close();
    }, 300);
  } catch (error) {
    console.error('Erreur lors de la lecture du son:', error);
  }
}
