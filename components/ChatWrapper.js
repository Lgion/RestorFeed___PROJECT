'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import GlobalChat from './GlobalChat';

export default function ChatWrapper() {
  const { user: clerkUser } = useUser();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (clerkUser) {
      fetchUserInfo();
    }
  }, [clerkUser]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      
      let dbUser = users.find(u => u.clerkId === clerkUser.id);
      
      // Si pas trouvé par clerkId, essayer par email
      if (!dbUser) {
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
        dbUser = users.find(u => u.email === userEmail);
        
        // Si trouvé par email, mettre à jour le clerkId dans la DB
        if (dbUser) {
          await fetch(`/api/users/${dbUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clerkId: clerkUser.id })
          });
        }
      }
      
      if (dbUser) {
        setCurrentUser(dbUser);
      } else {
        // Si l'utilisateur n'existe pas dans notre DB, le créer
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: clerkUser.emailAddresses[0]?.emailAddress,
            clerkId: clerkUser.id,
            username: clerkUser.username || clerkUser.firstName,
            role: 'user' // Rôle par défaut
          })
        });
        
        if (createResponse.ok) {
          const newUser = await createResponse.json();
          setCurrentUser(newUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Ne pas afficher le chat si pas d'utilisateur ou si utilisateur public
  if (!currentUser || currentUser.role === 'public') {
    return null;
  }

  return <GlobalChat currentUser={currentUser} />;
}
