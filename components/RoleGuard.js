import { hasMinRole } from "../lib/roles";

// Affiche les enfants seulement si le rôle courant est >= minRole
export default function RoleGuard({ minRole = "public", children }) {
  if (!hasMinRole(minRole)) return null;
  return children;
}
