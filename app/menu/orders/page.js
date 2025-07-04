"use client";
import { useEffect, useState } from "react";
import { CancelIcon, ArchiveIcon } from "./OrderCardIcons";
import { getAppDataKey } from "../../../utils/localStorageApp";

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
  // const [tableFilter, setTableFilter] = useState(getAppDataKey('tableNumber'));
  const [tableFilter, setTableFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState(false);

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
    
    // Filtrage par archivage et date
    let passesArchiveFilter;
    if (showArchived) {
      passesArchiveFilter = order.isArchived || !today;
    } else {
      passesArchiveFilter = !order.isArchived && today;
    }
    
    // Filtrage par numéro de table
    const passesTableFilter = !tableFilter || tableFilter === "" || order.table == tableFilter;
    
    // Filtrage par statut
    const passesStatusFilter = !statusFilter || order.status === statusFilter;
    
    return passesArchiveFilter && passesTableFilter && passesStatusFilter;
  });

  // Obtenir la liste unique des tables disponibles
  const availableTables = [...new Set(orders.map(order => order.table).filter(table => table != null))].sort((a, b) => a - b);

  return (
    <section className="orderList">
      {console.log(orders)}
      <h2 className="orderList__title">Commandes en cours</h2>
      {orders.length === 0 ? (
        <div className="orderList__empty">Aucune commande pour l'instant.</div>
      ) : (<>
        <section className="orderList__filter">
          <label>
            <span>Table </span>
            <select value={tableFilter || ""} onChange={e => setTableFilter(e.target.value || undefined)}>
              <option value="" selected>Toutes</option>
              {availableTables.map(table => (
                <option key={table} value={table}>Table {table}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Status </span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tous</option>
              <option value="En cours">En cours</option>
              <option value="Prête">Prête</option>
              <option value="Livrée">Livrée</option>
            </select>
          </label> 
        </section>

        <ul className="orderList__list">
          {filteredOrders.map((order, i) => (
            <li key={order.id} className="orderCard">
              <article>
                <header className="orderCard__header">
                  <span className="orderCard__number"><b>#{i + 1}</b></span>
                  <div style={{display:"flex",flexFlow:"column"}}>
                    <time className="orderCard__time" title={new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(order.createdAt || order.date))}>
                      {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(order.createdAt || order.date))}
                    </time>
                    <span className="orderCard__time-since">
                      Il y a {Math.round((new Date().getTime() - new Date(order.createdAt || order.date).getTime()) / 60000)} minutes
                    </span>
                  </div>

                  <span className={
                    `orderCard__badge orderCard__badge--client`
                  }>
                    {order.client ? `CLIENT: ${order.client}` : order.table ? `TABLE: ${order.table}` : "ANONYME"}
                  </span>
                  <span className={
                    `orderCard__badge orderCard__badge--status orderCard__status--${order.status
                      .replace(/é/g, 'e').replace(/è/g, 'e').replace(/à/g, 'a').replace(/ê/g, 'e').replace(/î/g, 'i') // fallback accents
                      .replace(/\s+/g, '-')
                      .toLowerCase()}`
                  }>
                    {order.status}
                  </span>
                </header>
                <ul className="orderCard__items">
                  {(order.items || []).map((item, j) => (
                    <li key={j} className="orderCard__item">{item.quantity || item.qty || 1} × {item.product?.name || item.name}</li>
                  ))}
                </ul>
                <nav className="orderCard__actions">
                  {ORDER_STATUS.map((st, idx) => (
                    <button
                      key={st}
                      className={`orderCard__actionBtn orderCard__actionBtn--${st      
                        .replace(/é/g, 'e').replace(/è/g, 'e').replace(/à/g, 'a').replace(/ê/g, 'e').replace(/î/g, 'i') // fallback accents
                        .replace(/\s+/g, '-')
                        .toLowerCase()}`}
                      disabled={order.status === st}
                      onClick={() => updateStatus(order.id, st)}
                    >
                      {st}
                    </button>
                  ))}
                  {isAdmin && (
  <>
    {/* Croix Annuler en haut à droite */}
    <button
      className="orderCard__actionBtn orderCard__actionBtn--cancel orderCard__close"
      onClick={() => cancelOrder(order.id)}
      title="Annuler la commande"
      aria-label="Annuler la commande"
      type="button"
    >
      <CancelIcon />
    </button>
    {/* Bouton Archiver avec icône Lucide */}
    <button
      className="orderCard__actionBtn orderCard__actionBtn--archive"
      onClick={() => archiveOrder(order.id)}
      title="Archiver la commande"
      aria-label="Archiver la commande"
      type="button"
    >
      <ArchiveIcon />
    </button>
  </>
)}

                </nav>
              </article>
            </li>
          ))}
        </ul>
      </>)}

      {/* Modal détail commande */}
      {selected && (
        <div className="orderModal">
          <div className="orderModal__content">
            <button className="orderModal__close" onClick={() => setSelected(null)}>×</button>
            <h3 className="orderModal__title">Détail de la commande #{selected.id}</h3>
            <div className="orderModal__row"><b>Client :</b> {selected.client}</div>
            <div className="orderModal__row"><b>Statut :</b> {selected.status}</div>
            <div className="orderModal__row"><b>Passée à :</b> {new Date(selected.createdAt).toLocaleString()}</div>
            <ul className="orderModal__items">
              {selected.items.map((item, i) => (
                <li key={i} className="orderModal__item">{item.qty} × {item.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
