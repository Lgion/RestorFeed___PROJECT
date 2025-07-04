"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import timestampStyles from '../assets/bem/components/orderTimestamp.module.scss';
import HurryUpButton from './HurryUpButton';

export default function CartHover({ handleValidate, isLoading }) {
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [openOrderIdx, setOpenOrderIdx] = useState(null);

  // Fonction pour obtenir le code couleur basé sur l'âge de la commande
  const getOrderAgeColor = (createdAt) => {
    if (!createdAt) return { color: '#888', label: 'Inconnue', urgency: 'unknown' };
    
    const now = new Date().getTime();
    const orderTime = new Date(createdAt).getTime();
    const ageInMinutes = Math.round((now - orderTime) / 60000);
    
    if (ageInMinutes <= 2) {
      return { 
        color: '#22c55e', // Vert - Très récent
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        label: 'Très récent',
        urgency: 'low'
      };
    } else if (ageInMinutes <= 5) {
      return { 
        color: '#eab308', // Jaune - Récent
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        label: 'Récent',
        urgency: 'low'
      };
    } else if (ageInMinutes <= 10) {
      return { 
        color: '#3b82f6', // Bleu - Commence à dater
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        label: 'Commence à dater',
        urgency: 'medium'
      };
    } else if (ageInMinutes <= 20) {
      return { 
        color: '#f97316', // Orange - Prend du temps
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        label: 'Prend du temps',
        urgency: 'high'
      };
    } else {
      return { 
        color: '#ef4444', // Rouge - Très ancien
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        label: 'Très ancien',
        urgency: 'critical'
      };
    }
  };

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
          // Les commandes peuvent être dans appData.orders ou directement dans appData si c'est un tableau
          let ordersArray = appData.orders || [];
          
          // Si le format est ancien (tableau direct)
          if (Array.isArray(appData) && !Array.isArray(appData.orders)) {
            ordersArray = appData;
          }
          
          // S'assurer que chaque commande a un tableau 'items' (pour la compatibilité)
          ordersArray = ordersArray.map(order => ({
            ...order,
            items: order.items || order.products || []
          }));
          
          const cartArray = appData.cart || [];
          
          setOrders(ordersArray);
          setCart(cartArray);
        } catch (error) {
          console.error('Error parsing localStorage:', error);
          setOrders([]);
          setCart([]);
        }
      }
    }

    loadData();

    // Ajouter un écouteur pour détecter les changements de localStorage
    const handleStorageChange = (event) => {
      if (event.key === 'restOrFeed') {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("orders-updated", handleStorageChange);
    window.addEventListener("cart-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("orders-updated", handleStorageChange);
      window.removeEventListener("cart-updated", handleStorageChange);
    };
  }, []);

  // Affichage du panier courant (cart)
  const appData = JSON.parse(localStorage.getItem("restOrFeed") || '{}');
  const currentOrders = appData.orders || [];
  
  // Utiliser les données directement du localStorage pour l'affichage
  const groupedCart = (appData.cart || []).reduce((acc, item) => {
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

  // Utiliser les données directement du localStorage pour l'affichage
  console.log('Orders from localStorage:', currentOrders);
  console.log('Parsed localStorage:', appData);

  return (
    <div className="cartHover" ref={ref}>
        {console.log(currentOrders)}
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
        {currentOrders.length === 0 ? (
          <div className="cartHover__empty">Aucune commande enregistrée.</div>
        ) : (
          <ul className="cartHover__orders">
            
            {currentOrders
              .filter(anyOrder => {
                if (!anyOrder) return false;
                const appData = JSON.parse(localStorage.restOrFeed || '{}');
                const tableNumber = appData.tableNumber;
                
                console.log("tableNumber:", tableNumber);
                console.log("order table:", anyOrder.table);
                console.log("order items:", anyOrder.items || anyOrder.products);
                
                return String(anyOrder.table) === String(tableNumber);
              })
              .map((myOrder, idx) => (
              <li
                key={myOrder.id || idx}
                className={`cartHover__order ${timestampStyles.orderContainer} ${(() => {
                  if (!myOrder.createdAt) return '';
                  const ageInfo = getOrderAgeColor(myOrder.createdAt);
                  return timestampStyles[ageInfo.urgency] || '';
                })()}`}
                onClick={() => setOpenOrderIdx(openOrderIdx === idx ? null : idx)}
                style={{cursor: 'pointer'}}
              >
                <div className="cartHover__orderBtn" style={{width: '100%', textAlign: 'left'}}>
                  <b>Commande #{idx+1}</b> — {myOrder.createdAt ? (() => {
                    const ageInfo = getOrderAgeColor(myOrder.createdAt);
                    const ageInMinutes = Math.round((new Date().getTime() - new Date(myOrder.createdAt).getTime()) / 60000);
                    
                    return (
                      <span 
                        className={`${timestampStyles.orderTimestamp} ${timestampStyles[ageInfo.urgency]}`}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '12px',
                          border: `1px solid ${ageInfo.color}`,
                          display: 'inline-block',
                          marginLeft: '4px'
                        }}
                        title={`${ageInfo.label} - Il y a ${ageInMinutes} minute${ageInMinutes > 1 ? 's' : ''}`}
                        data-urgency={ageInfo.urgency}
                      >
                        {new Intl.DateTimeFormat('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit' 
                        }).format(new Date(myOrder.createdAt))}
                        <span style={{ marginLeft: '4px', fontSize: '10px' }}>
                          ({ageInMinutes}min)
                        </span>
                      </span>
                    );
                  })() : <span style={{color: '#888'}}>Date inconnue</span>}
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
                <HurryUpButton 
                  orderId={myOrder.id || `order_${idx}`}
                  orderNumber={myOrder.orderNumber || `#${idx + 1}`}
                  tableId={myOrder.table || JSON.parse(localStorage.restOrFeed || '{}').tableNumber}
                  className="compact"
                />
                {openOrderIdx === idx && (myOrder.items?.length > 0 || myOrder.products?.length > 0) && (
                  <ul className="cartHover__orderList">
                    {(myOrder.items || []).map((prod, prodIdx) => {
                      const productName = prod.name || prod.product?.name || 'Produit sans nom';
                      const quantity = prod.quantity || 1;
                      const price = prod.price || prod.product?.price || 0;
                      const total = (price * quantity).toFixed(2);
                      
                      return (
                        <li key={prod.id || prod.productId || `prod-${idx}-${prodIdx}`} className="cartHover__orderItem">
                          <span>{productName}</span>
                          <span>x{quantity}</span>
                          <span>{total} €</span>
                        </li>
                      );
                    })}
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
