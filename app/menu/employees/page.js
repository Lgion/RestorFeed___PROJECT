"use client";
import { useState, useEffect } from "react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{maxWidth:600,margin:"0 auto",padding:24}}>
        <h1 style={{marginBottom:24}}>Gestion des employés</h1>
        <div style={{textAlign:'center',padding:40}}>Chargement des employés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{maxWidth:600,margin:"0 auto",padding:24}}>
        <h1 style={{marginBottom:24}}>Gestion des employés</h1>
        <div style={{textAlign:'center',padding:40,color:'red'}}>Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:600,margin:"0 auto",padding:24}}>
      <h1 style={{marginBottom:24}}>Gestion des employés</h1>
      <table style={{width:'100%',background:'#fff',borderRadius:8,overflow:'hidden',boxShadow:'0 2px 8px #0001',marginBottom:24}}>
        <thead>
          <tr style={{background:'#eee',textAlign:'left'}}>
            <th style={{padding:8}}>Avatar</th>
            <th style={{padding:8}}>Nom</th>
            <th style={{padding:8}}>Contact</th>
            <th style={{padding:8}}>Tables</th>
            <th style={{padding:8}}>Rôle</th>
            <th style={{padding:8}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td style={{padding:8}}><img src={emp.avatar} alt={emp.name} style={{width:36,height:36,borderRadius:'50%'}}/></td>
              <td style={{padding:8}}>{emp.name}</td>
              <td style={{padding:8}}>{emp.contact}</td>
              <td style={{padding:8}}>{emp.assignedTables?.join(', ') || 'Aucune'}</td>
              <td style={{padding:8}}>{emp.role}</td>
              <td style={{padding:8}}>
                <button onClick={()=>setSelected(emp)} style={{background:'#f4f4f4',border:'none',borderRadius:5,padding:'6px 12px',cursor:'pointer',fontWeight:500}}>Détail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal employé */}
      {selected && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#fff',borderRadius:16,padding:28,minWidth:280,boxShadow:'0 4px 24px #0002',position:'relative'}}>
            <button onClick={()=>setSelected(null)} style={{position:'absolute',top:10,right:10,border:'none',background:'none',fontSize:22,cursor:'pointer'}}>×</button>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
              <img src={selected.avatar} alt={selected.name} style={{width:54,height:54,borderRadius:'50%'}}/>
              <div>
                <div style={{fontWeight:600,fontSize:18}}>{selected.name}</div>
                <div style={{fontSize:13,color:'#888'}}>{selected.role}</div>
              </div>
            </div>
            <div><b>Contact :</b> {selected.contact}</div>
            <div><b>Tables assignées :</b> {selected.assignedTables?.join(', ') || 'Aucune'}</div>
            <div><b>Lieu :</b> {selected.location}</div>
            <div><b>Disponibilité :</b> {selected.availability}</div>
            <div><b>Planning :</b> {selected.schedule}</div>
            <button onClick={()=>setSelected(null)} style={{marginTop:18,background:'#111',color:'#fff',padding:'8px 18px',border:'none',borderRadius:6,fontWeight:500,width:'100%'}}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
