"use client";
import { useEffect, useState } from "react";

const ORDER_STATUS = ["En cours", "Prête", "Livrée"];

function getInitialOrders() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("orders");
    if (stored) return JSON.parse(stored);
  }
  return [];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setOrders(getInitialOrders());
  }, []);

  const updateStatus = (id, nextStatus) => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: nextStatus } : o
    );
    setOrders(updated);
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  return (
    <div>
      <h2 style={{marginBottom: 24}}>Commandes en cours</h2>
      {orders.length === 0 ? (
        <div>Aucune commande pour l'instant.</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {orders.map((order,i) => (
            <div key={order.id} style={{border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fafafa', boxShadow: '0 2px 8px #0001'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <b>#{i+1}</b> – {order.client?"CLIENT: "+order.client:order.table?"TABLE: "+order.table:"ANONYME"} – <span style={{fontSize: 12, color: '#888'}}>(
                    <span title={new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(order.date))}>
                      {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(order.date))}
                    </span>
                  )</span>
                </div>
                <span style={{padding: '2px 10px', borderRadius: 8, background: order.status === 'Livrée' ? '#2ecc40' : order.status === 'Prête' ? '#f1c40f' : '#3498db', color: '#fff', fontWeight: 'bold'}}>{order.status}</span>
              </div>
              <ul style={{margin: '8px 0 0 0', padding: 0, listStyle: 'none'}}>
                {order.items.map((item, i) => (
                  <li key={i} style={{fontSize: 15}}>{item.qty} × {item.name}</li>
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

