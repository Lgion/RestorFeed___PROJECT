"use client";
import { useEffect, useState } from "react";

const ORDER_STATUS = ["En cours", "Prête", "Livrée"];

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}


export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('restOrFeed');
      if (raw) {
        try {
          const appData = JSON.parse(raw);
          setIsAdmin(appData.role === 'admin');
        } catch {}
      }
    }
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
    // Synchronise localStorage
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('restOrFeed');
      let appData = {};
      try { appData = raw ? JSON.parse(raw) : {}; } catch {}
      appData.orders = data;
      localStorage.setItem('restOrFeed', JSON.stringify(appData));
    }
    setLoading(false);
  }
  useEffect(() => { fetchOrders(); }, []);

  // Met à jour le statut (En cours/Prête/Livrée) d'une commande
  async function updateStatus(id, nextStatus) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    fetchOrders();
  }
  // Archive une commande
  async function archiveOrder(id) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: true })
    });
    fetchOrders();
  }
  // Annule (supprime) une commande
  async function cancelOrder(id) {
    if (!window.confirm('Annuler cette commande ?')) return;
    let role = 'public';
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('restOrFeed');
        if (raw) {
          const appData = JSON.parse(raw);
          role = appData?.role || appData?.role || 'public';
          alert(role)
        }
      } catch {}
    }
    await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': role
      }
    });
    fetchOrders();
  }

  // Filtrage des commandes
  const filteredOrders = orders.filter(order => {
    const today = isToday(order.createdAt || order.date);
    if (showArchived) {
      return order.isArchived || !today;
    } else {
      return !order.isArchived && today;
    }
  });

  return (
    <div>
      <h2 style={{marginBottom: 24}}>Commandes en cours</h2>
      {orders.length === 0 ? (
        <div>Aucune commande pour l'instant.</div>
      ) : (
        <div key="okok" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {filteredOrders.map((order,i) => (
            <div key={order.id} style={{border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fafafa', boxShadow: '0 2px 8px #0001'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <b>#{i+1}</b> – {order.client?"CLIENT: "+order.client:order.table?"TABLE: "+order.table:"ANONYME"} – <span style={{fontSize: 12, color: '#888'}}>(
                    <span title={new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(order.createdAt || order.date))}>
                      {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(order.createdAt || order.date))}
                    </span>
                  )</span>
                </div>
                <span style={{padding: '2px 10px', borderRadius: 8, background: order.status === 'Livrée' ? '#2ecc40' : order.status === 'Prête' ? '#f1c40f' : '#3498db', color: '#fff', fontWeight: 'bold'}}>{order.status}</span>
              </div>
              <ul style={{margin: '8px 0 0 0', padding: 0, listStyle: 'none'}}>
                {(order.items || []).map((item, i) => (
                  <li key={i} style={{fontSize: 15}}>{item.quantity || item.qty || 1} × {item.product?.name || item.name}</li>
                ))}
              </ul>
              <div style={{marginTop: 10, display: 'flex', gap: 10}}>
                {ORDER_STATUS.map((st, idx) => (
                  <button
                    key={st}
                    disabled={order.status === st}
                    onClick={() => updateStatus(order.id, st)}
                    style={{
                      background: order.status === st ? '#ccc' : ['#3498db','#f1c40f','#2ecc40'][idx],
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '6px 14px',
                      fontWeight: 'bold',
                      cursor: order.status === st ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      style={{background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer'}}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => archiveOrder(order.id)}
                      style={{background: '#95a5a6', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer'}}
                    >
                      Archiver
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelected(order)}
                  style={{marginLeft: 'auto', background: '#fff', color: '#333', border: '1px solid #888', borderRadius: 4, padding: '6px 14px', cursor: 'pointer'}}
                >
                  Détail
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détail commande */}
      {selected && (
        <div style={{position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000}}>
          <div style={{background:'#fff', borderRadius:12, boxShadow:'0 4px 32px #0003', padding:32, minWidth:320, position:'relative'}}>
            <button onClick={() => setSelected(null)} style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,cursor:'pointer'}}>×</button>
            <h3>Détail de la commande #{selected.id}</h3>
            <div><b>Client :</b> {selected.client}</div>
            <div><b>Statut :</b> {selected.status}</div>
            <div><b>Passée à :</b> {new Date(selected.createdAt).toLocaleString()}</div>
            <ul style={{marginTop: 12}}>
              {selected.items.map((item, i) => (
                <li key={i}>{item.qty} × {item.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

