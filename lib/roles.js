// Liste des rôles disponibles
export const ROLES = ["public", "employee", "manager", "admin"];

// Récupère le rôle courant depuis localStorage (ou "public" par défaut)

import { getAppData, setAppData, getAppDataKey, setAppDataKey } from "../utils/localStorageApp";

export function getCurrentRole() {
  if (typeof window === "undefined") return "public";
  try {
    let role = getAppDataKey("role")
    // alert(role)
    console.log(role);
    
    return role || "public";
  } catch {
    return "public";
  }
}

// Définit le rôle courant dans localStorage (nouveau schéma)
export function setCurrentRole(role) {
  if (typeof window !== "undefined") {
    try {
      setAppDataKey("role", role);
      // Optionnel : synchronise aussi user.role si besoin
      const appData = getAppData();
      if (appData.user) {
        appData.user.role = role;
        setAppData(appData);
      }
    } catch {}
  }
}

// Vérifie si le rôle courant est au moins celui demandé (ordre croissant)
export function hasMinRole(minRole) {
  const order = { public: 0, employee: 1, manager: 2, admin: 3 };
  const current = getCurrentRole();
  // alert(current)
  return order[current] >= order[minRole];
}
