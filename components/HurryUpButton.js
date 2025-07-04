import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Clock, Zap } from 'lucide-react';
import styles from '../assets/bem/components/hurryUpButton.module.scss';

export default function HurryUpButton({ 
  orderId, 
  orderNumber, 
  tableId, 
  className = '', 
  disabled = false 
}) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const handleHurryUpClick = async (e) => {
    e.stopPropagation(); // Empêcher la propagation vers le parent
    
    if (hasRequested || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/help-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tableId: tableId || JSON.parse(localStorage.restOrFeed || '{}').tableNumber,
          orderId: orderId ? orderId.toString() : null,
          message: `🚀 URGENT: Accélérer la commande #${orderNumber} - Table ${tableId}`,
          priority: 'URGENT',
          type: 'HURRY_UP',
          userEmail: user?.emailAddresses[0]?.emailAddress || ""
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande');
      }
      
      setHasRequested(true);
      
      // Réinitialiser après 5 minutes
      setTimeout(() => {
        setHasRequested(false);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('Error sending hurry up request:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleHurryUpClick}
      disabled={disabled || isLoading || hasRequested}
      className={`${styles.hurryUpButton} ${className} ${hasRequested ? styles.requested : ''}`}
      title={hasRequested ? "Demande envoyée !" : "Demander d'accélérer cette commande"}
    >
      {isLoading ? (
        <Clock className={styles.icon} size={16} />
      ) : hasRequested ? (
        <span className={styles.requestedText}>✓ Demandé</span>
      ) : (
        <>
          <Zap className={styles.icon} size={16} />
          <span className={styles.buttonText}>Hurry Up!</span>
        </>
      )}
    </button>
  );
}
