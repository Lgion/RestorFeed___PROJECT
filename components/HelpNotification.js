import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Bell, X, User, Clock, CheckCircle, AlertTriangle, Zap, MessageSquare, HelpCircle, Play } from 'lucide-react';
import styles from '../assets/bem/components/helpNotification.module.scss';

export default function HelpNotification() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Récupérer l'utilisateur actuel depuis la base de données
  const fetchCurrentUser = async () => {
    if (!user?.id) {
      console.log('No user.id available:', user);
      return;
    }
    
    console.log('Fetching user with ID:', user.id);
    
    try {
      const response = await fetch(`/api/users/by-clerk-id/${user.id}`);
      console.log('User API response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Current user data:', userData);
        setCurrentUser(userData);
      } else {
        console.error('Failed to fetch user:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };
  
  // Charger les demandes d'aide depuis l'API
  const fetchHelpRequests = async () => {
    try {
      const response = await fetch('/api/help-requests');
      if (response.ok) {
        const helpRequests = await response.json();
        setNotifications(helpRequests);
        
        // Vérifier s'il y a de nouvelles notifications
        if (helpRequests.length > lastNotificationCount) {
          setHasNewNotification(true);
          playNotificationSound();
        }
        setLastNotificationCount(helpRequests.length);
      }
    } catch (error) {
      console.error('Error fetching help requests:', error);
    }
  };
  
  // Polling pour les nouvelles demandes d'aide
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    fetchCurrentUser();
    fetchHelpRequests();
    if (isOpen && process.env.NEXT_PUBLIC_NODE_ENV !== 'development') {
        const interval = setInterval(fetchHelpRequests, 5000); // Vérifier toutes les 5 secondes
        return () => clearInterval(interval);
    }
    
  }, [isLoaded, user, lastNotificationCount]);
  
  const playNotificationSound = () => {
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
  };
  
  const handleResolve = async (id) => {
    if (!currentUser) {
      console.error('Current user not loaded');
      return;
    }
    
    try {
      const response = await fetch('/api/help-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: 'RESOLVED',
          resolvedBy: currentUser.id 
        }),
      });
      
      if (response.ok) {
        // Rafraîchir la liste
        fetchHelpRequests();
      }
    } catch (error) {
      console.error('Error resolving help request:', error);
    }
  };
  
  const handleTakeAction = async (id) => {
    if (!currentUser) {
      console.error('Current user not loaded');
      return;
    }
    
    try {
      const response = await fetch('/api/help-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: 'IN_PROGRESS',
          resolvedBy: currentUser.id 
        }),
      });
      
      if (response.ok) {
        // Rafraîchir la liste
        fetchHelpRequests();
      }
    } catch (error) {
      console.error('Error updating help request:', error);
    }
  };
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (hasNewNotification) setHasNewNotification(false);
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#e74c3c';
      case 'HIGH': return '#f39c12';
      case 'NORMAL': return '#3498db';
      case 'LOW': return '#95a5a6';
      default: return '#3498db';
    }
  };
  
  const getTypeInfo = (type) => {
    switch (type) {
      case 'HURRY_UP':
        return { icon: Zap, label: 'Accélération', color: '#ff6b35' };
      case 'COMPLAINT':
        return { icon: AlertTriangle, label: 'Réclamation', color: '#e74c3c' };
      case 'ASSISTANCE':
        return { icon: HelpCircle, label: 'Assistance', color: '#3498db' };
      case 'GENERAL':
      default:
        return { icon: MessageSquare, label: 'Général', color: '#95a5a6' };
    }
  };
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className={styles.notificationContainer}>
      <button 
        className={`${styles.notificationButton} ${hasNewNotification ? styles.hasNew : ''}`}
        onClick={toggleNotifications}
        aria-label="Notifications d'aide"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </button>
      
      {isOpen && (
        <div className={styles.notificationPanel}>
          <div className={styles.panelHeader}>
            <h3>Demandes d'aide ({notifications.length})</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className={styles.notificationList}>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className={styles.notificationItem}>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <span 
                        className={styles.priorityBadge}
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      >
                        {notification.priority}
                      </span>
                      {notification.type && (() => {
                        const typeInfo = getTypeInfo(notification.type);
                        const TypeIcon = typeInfo.icon;
                        return (
                          <span 
                            className={styles.typeBadge}
                            style={{ color: typeInfo.color }}
                            title={typeInfo.label}
                          >
                            <TypeIcon size={14} />
                            {typeInfo.label}
                          </span>
                        );
                      })()}
                      <span className={styles.notificationTime}>
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <span className={styles.notificationMessage}>
                      {notification.message}
                    </span>
                    <span className={styles.notificationDetails}>
                      {notification.tableId && `Table: ${notification.tableId} • `}
                      {notification.orderId && `Commande: ${notification.orderId} • `}
                      Par: {notification.user?.username || notification.user?.email || notification.userId}
                    </span>
                  </div>
                  <div className={styles.actionButtons}>
                    {notification.status === 'PENDING' && (
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleTakeAction(notification.id)}
                        title="Prendre en charge"
                      >
                        <Play size={14} />
                      </button>
                    )}
                    <button 
                      className={styles.resolveButton}
                      onClick={() => handleResolve(notification.id)}
                      title="Marquer comme résolu"
                    >
                      <CheckCircle size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                Aucune demande d'aide pour le moment
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
