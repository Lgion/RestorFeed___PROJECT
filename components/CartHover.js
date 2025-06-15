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
    const handle = () => { console.log("dispatch eventndhidfhsdfuiohfuih");
    
      return setCart(JSON.parse(localStorage.getItem("cart") || "[]"));}
    window.addEventListener("storage", handle);
    window.addEventListener("cart-updated", handle);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("cart-updated", handle);
    };
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

  return (
    <div className="cart-hover" ref={ref}>
      <button
        className="cart-hover__btn"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        🛒 <span>Panier ({groupedArr.reduce((sum, item) => sum + item.quantity, 0) })</span>
      </button>
      {open && (
        <div
          className="cart-hover__popup"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <h4 className="cart-hover__title">Votre panier</h4>
          {groupedArr.length === 0 ? (
            <div className="cart-hover__empty">Votre panier est vide.</div>
          ) : (
            <ul className="cart-hover__list">
              {groupedArr.map((item) => (
                <li key={item.id} className="cart-hover__item">
                  <span style={{flex: 2}}>{item.name}</span>
                  <span style={{flex: 1, textAlign: 'right'}}>{item.quantity} × {item.price.toFixed(2)} €</span>
                  <span style={{flex: 1, textAlign: 'right', fontWeight: 'bold'}}>{(item.price * item.quantity).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          )}
          <div className="cart-hover__total">Total : {total.toFixed(2)} €</div>
          <Link href="/cart" className="cart-hover__validate">Valider le panier</Link>
        </div>
      )}
    </div>
  );
}
