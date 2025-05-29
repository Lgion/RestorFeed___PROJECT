"use client";
import { useParams, useRouter } from "next/navigation";

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

const MOCK_ORDERS = [
  { id: 101, supplierId: 1, date: "2025-05-20", amount: 320.50, status: "Livrée" },
  { id: 102, supplierId: 1, date: "2025-05-10", amount: 180.00, status: "En attente" },
  { id: 103, supplierId: 2, date: "2025-05-15", amount: 540.20, status: "Livrée" },
  { id: 104, supplierId: 3, date: "2025-05-08", amount: 220.00, status: "Annulée" },
  { id: 105, supplierId: 1, date: "2025-04-30", amount: 99.99, status: "Livrée" },
];

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id ? parseInt(params.id) : null;
  const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
  const orders = MOCK_ORDERS.filter(o => o.supplierId === id);

  if (!supplier) return (
    <div style={{maxWidth:500,margin:"60px auto",padding:24,textAlign:'center'}}>
      <h2>Fournisseur introuvable</h2>
      <button style={{marginTop:20,background:'#111',color:'#fff',padding:'8px 18px',border:'none',borderRadius:6,fontWeight:500}} onClick={()=>router.push('/suppliers')}>Retour à la liste</button>
    </div>
  );

  return (
    <div style={{maxWidth:600,margin:"60px auto",padding:24}}>
      <h1 style={{marginBottom:24}}>{supplier.name}</h1>
      <div style={{marginBottom:10}}><b>Catégorie :</b> {supplier.category}</div>
      <div style={{marginBottom:10}}><b>Contact :</b> {supplier.contact}</div>
      <div style={{marginBottom:10}}><b>Téléphone :</b> {supplier.phone}</div>
      <div style={{marginBottom:10}}><b>Adresse :</b> {supplier.address}</div>
      <div style={{marginBottom:20}}><b>Statut :</b> {supplier.status}</div>
      <h2 style={{marginTop:36,marginBottom:16,fontSize:20}}>Historique des commandes</h2>
      {orders.length === 0 ? (
        <div style={{color:'#888',marginBottom:24}}>Aucune commande pour ce fournisseur.</div>
      ) : (
        <table style={{width:'100%',background:'#fafafa',borderRadius:8,overflow:'hidden',boxShadow:'0 1px 4px #0001',marginBottom:24}}>
          <thead>
            <tr style={{background:'#eee',textAlign:'left'}}>
              <th style={{padding:8}}>Date</th>
              <th style={{padding:8}}>N° Commande</th>
              <th style={{padding:8}}>Montant (€)</th>
              <th style={{padding:8}}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{padding:8}}>{order.date}</td>
                <td style={{padding:8}}>{order.id}</td>
                <td style={{padding:8}}>{order.amount.toFixed(2)}</td>
                <td style={{padding:8}}>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button style={{background:'#111',color:'#fff',padding:'8px 18px',border:'none',borderRadius:6,fontWeight:500}} onClick={()=>router.push('/suppliers')}>Retour à la liste</button>
    </div>
  );
}
