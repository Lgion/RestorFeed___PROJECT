import { ROLES, getCurrentRole, setCurrentRole } from "../lib/roles";
import { useState, useEffect } from "react";

export default function RoleSwitcher() {
  const [role, setRole] = useState("public");

  useEffect(() => {
    setRole(getCurrentRole());
  }, []);

  const handleChange = (e) => {
    setRole(e.target.value);
    setCurrentRole(e.target.value);
    window.location.reload(); // reload pour appliquer le rôle partout
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
