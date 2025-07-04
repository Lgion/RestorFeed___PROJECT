"use client"

// Ce composant synchronise Clerk et Prisma/localStorage après login/signup
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getAppData, setAppData, initializeAppData } from "../utils/localStorageApp";

export default function ClerkSync() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    async function initializeAndSync() {
      // Supprimer l'ancien localStorage et initialiser avec les nouvelles données
      localStorage.removeItem('restOrFeed');
      await initializeAppData();

      if (isSignedIn && user) {
        // Vérifie si user existe dans Prisma
        let prismaUser = null;
        let res = await fetch(`/api/users/clerk/${user.id}`);
        const role = user.emailAddresses?.[0]?.emailAddress === process.env.NEXT_PUBLIC_ADMIN_EMAIL 
          ? "admin" 
          : user.emailAddresses?.[0]?.emailAddress === process.env.NEXT_PUBLIC_MANAGER_EMAIL
            ? "manager"
            : user.emailAddresses?.[0]?.emailAddress === process.env.NEXT_PUBLIC_EMPLOYEE_EMAIL
              ? "employee"
              : "public";
        console.log(role);
        console.log(process.env.NEXT_PUBLIC_ADMIN_EMAIL);
        console.log(user.emailAddresses?.[0]?.emailAddress);
        
        if (res.ok) {
          prismaUser = await res.json();
        } else {
          // Crée le user dans Prisma
          res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.emailAddresses?.[0]?.emailAddress,
              clerkId: user.id,
              username: user.username || null,
              role,
            })
          });
          if (res.ok) {
            prismaUser = await res.json();
          }
        }
        const ls = getAppData();
        ls.role = role;
        if (prismaUser) {
          ls.user = {
            id: prismaUser.id,
            clerkId: prismaUser.clerkId,
            email: prismaUser.email,
            username: prismaUser.username,
            role: prismaUser.role,
          };
        }
        setAppData(ls);
      }
    }

    // Exécuter la fonction asynchrone
    initializeAndSync();
  }, [isSignedIn, user]);

  return null;
}
