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
          <div className="cartHover__empty">Votre commande est vide.</div>
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
                  <b>Commande #{idx+1}</b> — {myOrder.createdAt ? <span title={"Il y a "+(Math.round((new Date().getTime() - new Date(myOrder.createdAt || myOrder.date).getTime()) / 60000))+" minutes"}>{new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(myOrder.createdAt))}</span> : 'Date inconnue'}
                  <span style={{marginLeft:8, color:'#888', fontWeight:'normal'}}>
                    {myOrder.status ? `(${myOrder.status})` : ''}
                    {myOrder.table ? ` | Table ${myOrder.table}` : ''}
                  </span>
                  <span style={{marginLeft: 8, color: '#2c5530', fontWeight: 'bold'}}>
                    TOTAL: {((myOrder.items || myOrder.products || []).reduce((total, item) => {
                      const price = item.price || item.product?.price || 0;
                      const quantity = item.quantity || 1;
                      return total + (price * quantity);
                    }, 0)).toFixed(2)} €
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
        <hr style={{margin: "1rem 0px"}}/>
        <div className="cartHover__total">
          <p className="mb-0 font-weight-bold">Total: {(orders
            .filter(anyOrder => anyOrder.table == JSON.parse(localStorage.restOrFeed).tableNumber)
            .reduce((total, order) => {
              const orderTotal = (order.items || order.products || []).reduce((sum, item) => {
                const price = item.price || item.product?.price || 0;
                const quantity = item.quantity || 1;
                return sum + (price * quantity);
              }, 0);
              return total + orderTotal;
            }, 0) || 0).toFixed(2)} €</p>
          <Link href="/cart" className="btn btn-primary mt-2">
            Passer &agrave; la caisse
          </Link>
        </div>
      </div>
    </div>
  );
}
