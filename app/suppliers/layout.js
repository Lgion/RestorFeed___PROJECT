"use client";
import { useState } from "react";

const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: "Sushi Pro France",
    contact: "contact@sushipro.fr",
    phone: "01 23 45 67 89",
    address: "12 rue du Poisson, 75001 Paris",
    category: "Poissonnerie",
    status: "Actif"
  },
  {
    id: 2,
    name: "Tokyo Rice",
    contact: "commande@tokyorice.jp",
    phone: "+81 3-1234-5678",
    address: "2-1-1 Nihonbashi, Tokyo",
    category: "Riz & épicerie",
    status: "Actif"
  },
  {
    id: 3,
    name: "Fraîcheur Verte",
    contact: "fraicheur@verte.fr",
    phone: "04 56 78 90 12",
    address: "88 avenue des Légumes, 69007 Lyon",
    category: "Fruits & Légumes",
    status: "En attente"
  }
];

import { useRouter } from "next/navigation";

export default function SuppliersPage({ children }) {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  return (
    <div style={{maxWidth:700,margin:"0 auto",padding:24}}>
      <h1 style={{marginBottom:24}}>Gestion des fournisseurs</h1>
      <table style={{width:'100%',background:'#fff',borderRadius:8,overflow:'hidden',boxShadow:'0 2px 8px #0001',marginBottom:24}}>
        <thead>
          <tr style={{background:'#eee',textAlign:'left'}}>
            <th style={{padding:8}}>Nom</th>
            <th style={{padding:8}}>Contact</th>
            <th style={{padding:8}}>Téléphone</th>
            <th style={{padding:8}}>Catégorie</th>
            <th style={{padding:8}}>Statut</th>
            <th style={{padding:8}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(sup => (
            <tr key={sup.id} style={{cursor:'pointer'}} onClick={()=>router.push(`/suppliers/${sup.id}`)}>
              <td style={{padding:8}}>{sup.name}</td>
              <td style={{padding:8}}>{sup.contact}</td>
              <td style={{padding:8}}>{sup.phone}</td>
              <td style={{padding:8}}>{sup.category}</td>
              <td style={{padding:8}}>{sup.status}</td>
              <td style={{padding:8}}>
                <button onClick={e=>{e.stopPropagation();setSelected(sup)}} style={{background:'#f4f4f4',border:'none',borderRadius:5,padding:'6px 12px',cursor:'pointer',fontWeight:500}}>Détail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
      {/* Modal fournisseur */}
      {selected && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#fff',borderRadius:16,padding:28,minWidth:280,boxShadow:'0 4px 24px #0002',position:'relative'}}>
            <button onClick={()=>setSelected(null)} style={{position:'absolute',top:10,right:10,border:'none',background:'none',fontSize:22,cursor:'pointer'}}>×</button>
            <div style={{fontWeight:600,fontSize:18,marginBottom:10}}>{selected.name}</div>
            <div><b>Catégorie :</b> {selected.category}</div>
            <div><b>Contact :</b> {selected.contact}</div>
            <div><b>Téléphone :</b> {selected.phone}</div>
            <div><b>Adresse :</b> {selected.address}</div>
            <div><b>Statut :</b> {selected.status}</div>
            <button onClick={()=>setSelected(null)} style={{marginTop:18,background:'#111',color:'#fff',padding:'8px 18px',border:'none',borderRadius:6,fontWeight:500,width:'100%'}}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
