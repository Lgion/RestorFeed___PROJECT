"use client";

import { useState } from "react";

export default function CartPage() {
  // Le panier sera récupéré du localStorage pour persister entre les pages
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }
    return [];
  });

  // Grouper les produits par id
  const grouped = cart.reduce((acc, item) => {
    const key = item.id;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: item.quantity || 1 };
    } else {
      acc[key].quantity += item.quantity || 1;
    }
    return acc;
  }, {});
  const groupedArr = Object.values(grouped);
  const total = groupedArr.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const [orderSent, setOrderSent] = useState(false);

  const handleValidate = () => {
    // Simule l'envoi de la commande
    localStorage.setItem("orders", JSON.stringify([
      ...(JSON.parse(localStorage.getItem("orders") || "[]")),
      {
        items: cart,
        date: new Date().toISOString(),
        status: "En cours",
        client: (localStorage.getItem("userPseudo")),
        table: localStorage.getItem("tableNumber") 
      }
    ]));
    localStorage.removeItem("cart");
    setCart([]);
    setOrderSent(true);
  };

  if (orderSent) {
    return (
      <div style={{maxWidth: 600, margin: '0 auto', padding: 24}}>
        <h2>Merci pour votre commande !</h2>
        <p>Votre commande a bien été enregistrée et sera traitée par un employé.</p>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 600, margin: '0 auto', padding: 24}}>
      <h1>Votre panier</h1>
      {groupedArr.length === 0 ? (
        <div>Votre panier est vide.</div>
      ) : (
        <>
          <ul style={{padding: 0, listStyle: 'none'}}>
            {groupedArr.map((item) => (
              <li key={item.id} style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
                <span style={{flex: 2}}>{item.name}</span>
                <span style={{flex: 1, textAlign: 'right'}}>{item.quantity} × {item.price.toFixed(2)} €</span>
                <span style={{flex: 1, textAlign: 'right', fontWeight: 'bold'}}>{(item.price * item.quantity).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          <div style={{marginTop: 12, fontWeight: 'bold'}}>
            Total : {total.toFixed(2)} €
          </div>
          <button onClick={handleValidate} style={{marginTop: 24, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer'}}>
            Valider la commande
          </button>
        </>
      )}
    </div>
  );
}
