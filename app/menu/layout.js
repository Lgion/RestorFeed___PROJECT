"use client"

import { products } from "../../data/products";
import ProductCard from "../../components/ProductCard";
import RoleSwitcher from "../../components/RoleSwitcher";
import RoleGuard from "../../components/RoleGuard";
import Notification from "../../components/Notification";
import ActionHeader from "../../components/ActionHeader";
import { useState } from "react";


import { usePathname, useRouter } from 'next/navigation';

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
        padding: 32,
        minWidth: 340,
        minHeight: 200,
        position: 'relative',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'transparent',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          color: '#888',
        }} aria-label="Fermer">×</button>
        {children}
      </div>
    </div>
  );
}

export default function MenuLayout({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }
    return [];
  });
  const [notif, setNotif] = useState("");

  const handleAdd = (product) => {
    setCart((prev) => {
      const updated = [...prev, product];
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(updated));
      }
      return updated;
    });
    setNotif(`${product.name} ajouté au panier !`);
  };

  const handleRemove = (idx) => {
    setCart((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const pathname = usePathname();
  const router = useRouter();
  // On veut afficher la modal pour toutes les sous-pages de /menu sauf /menu lui-même
  const isModal = pathname && pathname.startsWith('/menu/') && pathname !== '/menu';

  return (
    <>
      <div style={{maxWidth: 600, margin: '0 auto', padding: 24}}>
        <Notification message={notif} onClose={() => setNotif("")} />
        <RoleSwitcher />
        <ActionHeader />
        <h1 style={{color: '#c0392b'}}>Menu Digital - Sushi</h1>
        {/* Bloc employé */}
        <RoleGuard minRole="employee">
          <button style={{marginBottom: 8, background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => router.push('/menu/orders')}>
            Voir les commandes en cours
          </button>
        </RoleGuard>
        {/* Bloc manager */}
        <RoleGuard minRole="manager">
          <div style={{marginBottom: 8}}>
            <button style={{background: '#f39c12', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer', marginRight: 8}} onClick={() => router.push('/menu/dashboard')}>
              Dashboard Manager
            </button>
            <button style={{background: '#16a085', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => router.push('/menu/employees')}>
              Gestion Employés
            </button>
          </div>
        </RoleGuard>
        {/* Bloc admin */}
        <RoleGuard minRole="admin">
          <div style={{marginBottom: 8}}>
            <button style={{background: '#8e44ad', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer', marginRight: 8}} onClick={() => router.push('/menu/admin')}>
              Administration complète
            </button>
            <button style={{background: '#c0392b', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => router.push('/menu/providers')}>
              Gestion Fournisseurs
            </button>
          </div>
        </RoleGuard>
        <div>
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} onAdd={handleAdd} />
          ))}
        </div>
        <div style={{marginTop: 32, padding: 16, background: '#f4f4f4', borderRadius: 8}}>
          <h3>Panier</h3>
          {cart.length === 0 ? (
            <div>Votre panier est vide.</div>
          ) : (
            <ul style={{padding: 0, listStyle: 'none'}}>
              {cart.map((item, idx) => (
                <li key={idx} style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
                  <span style={{flex: 1}}>{item.name} - {item.price.toFixed(2)} €</span>
                  <button onClick={() => handleRemove(idx)} style={{background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', marginLeft: 8, cursor: 'pointer'}}>Supprimer</button>
                </li>
              ))}
            </ul>
          )}
          <div style={{marginTop: 12, fontWeight: 'bold'}}>
            Total : {cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)} €
          </div>
          <a href="/cart" style={{display: 'inline-block', marginTop: 18, background: '#e74c3c', color: '#fff', borderRadius: 4, padding: '12px 24px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1.1em'}}>
            Valider le panier ({cart.length})
          </a>
        </div>
      </div>
      <Modal open={isModal} onClose={() => router.push('/menu')}>
        {children}
      </Modal>
    </>
  );
}
