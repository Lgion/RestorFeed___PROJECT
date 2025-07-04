import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { HelpCircle } from 'lucide-react';
import styles from '../assets/bem/components/helpButton.module.scss';

export default function HelpButton({ tableId, className = '', priority = 'NORMAL' }) {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleHelpClick = async () => {

    // if (!isLoaded || !user) return;
    
      console.log(0);
      setIsLoading(true);
    
    try {
      console.log(1);
      
      const response = await fetch('/api/help-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tableId,
          message: `Aide demandée par ${user?.firstName || user?.emailAddresses[0]?.emailAddress || "Table n°"+JSON.parse(localStorage.restOrFeed).tableNumber}`,
          priority,
          userEmail: user?.emailAddresses[0]?.emailAddress || ""
        }),
      });
      console.log(2);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la demande d\'aide');
      }
      console.log(3);
      
      // Afficher un message de succès
      alert('Votre demande d\'aide a été envoyée ! Un serveur sera notifié.');
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.helpButtonContainer} ${className}`}>
      <button
        className={styles.helpButton}
        onClick={handleHelpClick}
        // disabled={isLoading || !isLoaded}
        disabled={isLoading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Demander de l'aide"
      >
        <HelpCircle size={18} />
        {isLoading ? 'Envoi...' : 'Aide'}
      </button>
      
      {showTooltip && (
        <div className={styles.tooltip}>
          Cliquez pour demander de l'aide
        </div>
      )}
    </div>
  );
}
