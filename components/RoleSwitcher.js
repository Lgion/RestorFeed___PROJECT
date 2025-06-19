import { ROLES, getCurrentRole, setCurrentRole } from "../lib/roles";
import { useState, useEffect } from "react";

export default function RoleSwitcher() {
  const [role, setRole] = useState(() => getCurrentRole());

  useEffect(() => {
    // Synchronise le rôle local avec localStorage (restOrFeed.role)
    const syncRole = () => setRole(getCurrentRole());
    window.addEventListener('storage', syncRole);
    return () => window.removeEventListener('storage', syncRole);
  }, []);

  const handleChange = (e) => {
    setCurrentRole(e.target.value); // met à jour localStorage.restOrFeed.role
    setRole(e.target.value);        // met à jour l'état local pour le select
    window.location.reload();       // reload pour appliquer le rôle partout
  };


  return (
    <div style={{marginBottom: 24}}>
      <label htmlFor="role-select" style={{marginRight: 8}}>Rôle :</label>
      <select id="role-select" value={role} onChange={handleChange}>
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <span style={{marginLeft: 12, color: '#888'}}>({role})</span>
    </div>
  );
}
