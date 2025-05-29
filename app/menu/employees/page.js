"use client";
import { useState } from "react";

const MOCK_EMPLOYEES = [
  {
    id: 1,
    name: "Ethan Carter",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    contact: "555–123–4567",
    assignedTables: [1, 2, 3],
    location: "Dining Area",
    availability: "Available",
    schedule: "Mon–Fri, 10 AM - 6 PM",
    role: "Serveur"
  },
  {
    id: 2,
    name: "Alice Dupont",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    contact: "555–987–6543",
    assignedTables: [4, 5],
    location: "Terrasse",
    availability: "Absent",
    schedule: "Tue–Sat, 12 PM - 8 PM",
    role: "Serveuse"
  },
  {
    id: 3,
    name: "Jean Martin",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    contact: "555–111–2222",
    assignedTables: [6],
    location: "Bar",
    availability: "Available",
    schedule: "Mon–Fri, 18 PM - 23 PM",
    role: "Barman"
  }
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [selected, setSelected] = useState(null);

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
              <td style={{padding:8}}>{emp.assignedTables.join(', ')}</td>
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
            <div><b>Tables assignées :</b> {selected.assignedTables.join(', ')}</div>
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
