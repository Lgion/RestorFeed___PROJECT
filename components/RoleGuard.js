import { hasMinRole, hasMaxRole } from "../lib/roles";

// Affiche les enfants seulement si le rôle courant est >= minRole et <= maxRole (si spécifié)
export default function RoleGuard({ minRole = "public", maxRole, children }) {
  if (!hasMinRole(minRole)) return null;
  if (maxRole && !hasMaxRole(maxRole)) return null;
  return children;
}
