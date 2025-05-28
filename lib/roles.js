// Liste des rôles disponibles
export const ROLES = ["public", "employee", "manager", "admin"];

// Récupère le rôle courant depuis localStorage (ou "public" par défaut)
export function getCurrentRole() {
  if (typeof window === "undefined") return "public";
  return localStorage.getItem("role") || "public";
}

// Définit le rôle courant dans localStorage
export function setCurrentRole(role) {
  if (typeof window !== "undefined") {
    localStorage.setItem("role", role);
  }
}

// Vérifie si le rôle courant est au moins celui demandé (ordre croissant)
export function hasMinRole(minRole) {
  const order = { public: 0, employee: 1, manager: 2, admin: 3 };
  const current = getCurrentRole();
  return order[current] >= order[minRole];
}
