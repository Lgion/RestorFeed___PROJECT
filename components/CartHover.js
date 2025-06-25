"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function CartHover({ handleValidate, isLoading }) {
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [openOrderIdx, setOpenOrderIdx] = useState(null);

  const ref = useRef();

  useEffect(() => {
    function loadData() {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("restOrFeed");
        if (!raw) {
          setOrders([]);
          setCart([]);
          return;
        }
        try {
          const appData = JSON.parse(raw);
          setOrders(appData.orders || []);
          setCart(appData.cart || []);
        } catch {
          setOrders([]);
          setCart([]);
        }
      }
    }
    loadData();
    const handle = () => loadData();
    window.addEventListener("storage", handle);
    window.addEventListener("orders-updated", handle);
    window.addEventListener("cart-updated", handle);
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("orders-updated", handle);
      window.removeEventListener("cart-updated", handle);
    };
  }, []);

  // Affichage du panier courant (cart)
  const groupedCart = cart.reduce((acc, item) => {
    const key = item.id;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: item.quantity || 1 };
    } else {
      acc[key].quantity += item.quantity || 1;
    }
    return acc;
  }, {});
  const cartArr = Object.values(groupedCart);
  const cartTotal = cartArr.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="cartHover" ref={ref}>
      <div className="cartHover__popup">
        <h4 className="cartHover__title">Panier en cours</h4>
        {cartArr.length === 0 ? (
          <div className="cartHover__empty">Votre panier est vide.</div>
        ) : (
          <ul className="cartHover__list">
            {cartArr.map(item => (
              <li key={item.id} className="cartHover__item">
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        )}
        <div className="cartHover__total">Total : {cartTotal.toFixed(2)} €</div>
        <button
          className="cartHover__validate"
          disabled={cartArr.length === 0 || isLoading}
          onClick={handleValidate}
        >
          {isLoading ? 'Envoi en cours...' : 'Valider la commande'}
        </button>
        <hr style={{margin: '1rem 0'}} />
        <h4 className="cartHover__title">Commandes enregistrées</h4>
        {orders.length === 0 ? (
          <div className="cartHover__empty">Aucune commande enregistrée.</div>
        ) : (
          <ul className="cartHover__orders">
            {console.log(orders)}
            
            {orders.filter(anyOrder=>anyOrder.table==JSON.parse(localStorage.restOrFeed).tableNumber).map((myOrder, idx) => (
              <li
                key={myOrder.id || idx}
                className="cartHover__order"
                onClick={() => setOpenOrderIdx(openOrderIdx === idx ? null : idx)}
                style={{cursor: 'pointer'}}
              >
                <div className="cartHover__orderBtn" style={{width: '100%', textAlign: 'left'}}>
                  <b>Commande #{myOrder.id || idx+1}</b> — {myOrder.createdAt ? new Date(myOrder.createdAt).toLocaleString() : 'Date inconnue'}
                  <span style={{marginLeft:8, color:'#888', fontWeight:'normal'}}>
                    {myOrder.status ? `(${myOrder.status})` : ''}
                    {myOrder.table ? ` | Table ${myOrder.table}` : ''}
                  </span>
                </div>
                {openOrderIdx === idx && (myOrder.items || myOrder.products) && (
                  <ul className="cartHover__orderList">
                    {(myOrder.items || myOrder.products).map(prod => (
                      <li key={prod.id || prod.productId} className="cartHover__orderItem">
                        <span>{prod.name || prod.product?.name || ''}</span>
                        <span>x{prod.quantity || 1}</span>
                        <span>{((prod.price || prod.product?.price || 0) * (prod.quantity || 1)).toFixed(2)} €</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
