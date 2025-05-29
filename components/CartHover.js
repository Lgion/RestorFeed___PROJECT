"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function CartHover() {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    }
    const handle = () => setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          background: "#e74c3c",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        🛒 Panier ({cart.length})
      </button>
      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            minWidth: 260,
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
            padding: 16,
            zIndex: 200,
          }}
        >
          <h4 style={{margin: 0, marginBottom: 8, color: '#c0392b'}}>Votre panier</h4>
          {cart.length === 0 ? (
            <div style={{color: '#888'}}>Votre panier est vide.</div>
          ) : (
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {cart.map((item, idx) => (
                <li key={idx} style={{display: 'flex', alignItems: 'center', marginBottom: 6}}>
                  <span style={{flex: 1}}>{item.name} - {item.price.toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          )}
          <div style={{marginTop: 10, fontWeight: 'bold'}}>Total : {total.toFixed(2)} €</div>
          <Link href="/cart" style={{display: 'inline-block', marginTop: 14, background: '#e74c3c', color: '#fff', borderRadius: 4, padding: '10px 20px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1em'}}>Valider le panier</Link>
        </div>
      )}
    </div>
  );
}
