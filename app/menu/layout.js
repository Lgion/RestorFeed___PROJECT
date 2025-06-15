"use client"

// import { products } from "../../data/products"; // plus utilisé
import { useEffect, useState } from 'react';
import ProductCard from "../../components/ProductCard";
import Notification from "../../components/Notification";
import Confetti from "../../components/Confetti";


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
        position: 'absolute',
        top: "8em",
        bottom: "3em",
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


// Mapping catégorie -> emoji
const CATEGORY_ICONS = {
  'tous': '🍱',
  'sushi': '🍣',
  'boisson': '🥤',
  'dessert': '🍨',
  'entrée': '🥗',
  'accompagnement': '🍚',
  // Ajoute d'autres catégories ici si besoin
};


export default function MenuLayout({ children }) {
  const [products, setProducts] = useState([]);
  const [orderSent, setOrderSent] = useState(false);
  // Import dynamique pour ne charger products.js que côté client
  useEffect(() => {
    window.dispatchEvent(new Event('cart-updated'));

    if (typeof window !== 'undefined') {
      let stored = localStorage.getItem('products');
      if (!stored) {
        import('../../data/products').then(mod => {
          localStorage.setItem('products', JSON.stringify(mod.products));
          setProducts(mod.products);
        });
      } else {
        try {
          setProducts(JSON.parse(stored));
        } catch {
          setProducts([]);
        }
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let tableNumber = localStorage.getItem('tableNumber');
      if (!tableNumber) {
        tableNumber = String(Math.floor(10 + Math.random() * 90)); // 2 chiffres
        localStorage.setItem('tableNumber', tableNumber);
      }
    }
  }, []);
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
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
    setOrderSent(true);
  };

  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    }
    return [];
  });
  const [notif, setNotif] = useState("");
  const [categoryFilter, setCategoryFilter] = useState('Tous');

  const handleSub = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex(item => item.id === product.id);
      console.log(idx);

      if (idx === -1) return prev;
      const updated = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(updated));
        window.dispatchEvent(new Event('cart-updated'));
      }
      return updated;
    });
    setNotif(`1 ${product.name} retiré du panier !`);
  };

  const handleAdd = (product) => {
    setCart((prev) => {
      const updated = [...prev, product];
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(updated));
        window.dispatchEvent(new Event('cart-updated'));
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
        window.dispatchEvent(new Event('cart-updated'));
      }
      return updated;
    });
  };

  const pathname = usePathname();
  const router = useRouter();
  // On veut afficher la modal pour toutes les sous-pages de /menu sauf /menu lui-même
  const isModal = pathname && pathname.startsWith('/menu/') && pathname !== '/menu';

  { products.sort((a, b) => a.category.localeCompare(b.category)) }


  // Détection admin/superadmin
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      setIsAdmin(role === 'admin' || role === 'superadmin');
    }
  }, []);

  // Handlers CRUD produits
  const handleDeleteProduct = (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
  };
  const handleEditProduct = (prod) => {
    setEditProduct(prod);
    setShowEditModal(true);
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const handleAddProduct = () => {
    setEditProduct(null);
    setShowEditModal(true);
  };

  return (
    <>
      <main className="menuLayout">
        <Notification message={notif} onClose={() => setNotif("")} />

        <h1 className="menuLayout__title">Menu Digital - Sushi</h1>

        <section className="menuLayout__menu">
            <ul className="categoryFilter categoryFilter--vertical">
              {/* Mapping catégorie -> emoji */}
              {['Tous', ...Array.from(new Set(products.map(p => p.category)))].map(cat => (
                <li
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`categoryFilter__btn${categoryFilter === cat ? ' categoryFilter__btn--active' : ''}`}
                >
                  <span className="categoryFilter__icon">{CATEGORY_ICONS[cat.toLowerCase()] || '🍱'}</span>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </li>
              ))}
            </ul>
            {isAdmin && (
              <button className="menuLayout__addBtn" onClick={handleAddProduct} title="Ajouter un produit">
                + Ajouter
              </button>
            )}
        </section>

        <ul className="products">
          {(categoryFilter === 'Tous' ? products : products.filter(p => p.category === categoryFilter)).map((prod) => {
            const quantity = cart.filter(item => item.id === prod.id).length;
            return (
              <ProductCard
                key={prod.id}
                product={prod}
                onAdd={handleAdd}
                onSub={handleSub}
                isAdmin={isAdmin}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                quantity={quantity}
              />
            );
          })}
          {showEditModal && (
            <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
              {/* Formulaire d'ajout/édition produit ici */}
              <div style={{ minWidth: 300 }}>
                <h2>{editProduct ? 'Éditer' : 'Ajouter'} un produit</h2>
                <form className="product-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <label>
                    Nom du produit
                    <input name="name" type="text" defaultValue={editProduct?.name || ''} required />
                  </label>
                  <label>
                    Description
                    <textarea name="description" defaultValue={editProduct?.description || ''} />
                  </label>
                  <label>
                    Prix (€)
                    <input name="price" type="number" step="0.01" min="0" defaultValue={editProduct?.price || ''} required />
                  </label>
                  <label>
                    Catégorie
                    <input name="category" type="text" defaultValue={editProduct?.category || ''} required />
                  </label>
                  <label>
                    URL de l'image
                    <input name="image" type="text" defaultValue={editProduct?.image || ''} />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input name="customizable" type="checkbox" defaultChecked={!!editProduct?.customizable} /> Customisable
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input name="status" type="checkbox" defaultChecked={editProduct?.status !== false} /> Actif (affiché)
                  </label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 22px', fontWeight: 'bold', fontSize: '1em', cursor: 'pointer' }}>Enregistrer</button>
                    <button type="button" onClick={() => setShowEditModal(false)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 22px', fontWeight: 'bold', fontSize: '1em', cursor: 'pointer' }}>Annuler</button>
                  </div>
                </form>
                <button onClick={() => setShowEditModal(false)}>Annuler</button>
              </div>
            </Modal>
          )}
        </ul>
        <div className="cart">
          <h3>Panier</h3>
          {/* Panier groupé par produit (id) */}
          {(() => {
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
            return groupedArr.length === 0 ? (
              <div>Votre panier est vide.</div>
            ) : (
              <>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {groupedArr.map((item) => (
                    <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ flex: 2 }}>{item.name}</span>
                      <span style={{ flex: 1, textAlign: 'right' }}>{item.quantity} × {item.price.toFixed(2)} €</span>
                      <span style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toFixed(2)} €</span>
                      <button onClick={() => handleRemove(cart.findIndex(i => i.id === item.id))} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', marginLeft: 8, cursor: 'pointer' }}>Supprimer</button>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 12, fontWeight: 'bold' }}>
                  Total : {groupedArr.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} €
                </div>
                <button onClick={handleValidate} style={{ marginTop: 24, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer' }}>
                  {/* Valider la commande ({groupedArr.reduce((sum, item) => sum + item.quantity, 0)}) */}
                  Valider la commande
                </button>
              </>
            );
          })()}

        </div>
      </main>
      <Modal open={isModal} onClose={() => router.push('/menu')}>
        {children}
      </Modal>
      <Confetti trigger={orderSent} />
    </>
  );
}
