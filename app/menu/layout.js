"use client"

// import { products } from "../../data/products"; // plus utilisé
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from "next/navigation";
// import { initializeAppData } from "../../utils/localStorageApp";
import { getAppDataKey, setAppDataKey } from "../../utils/localStorageApp";
import ProductCard from "../../components/ProductCard";
import ActionHeader from "../../components/ActionHeader";
import Notification from "../../components/Notification";
import Confetti from "../../components/Confetti";


import { usePathname, useRouter } from 'next/navigation';

import Modal from "../../components/Modal";


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



// Component that uses useSearchParams
function MenuLayoutContent({ children }) {
  const searchParams = useSearchParams();
  const [quantities, setQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orderSent, setOrderSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });

  // Import dynamique pour ne charger products.js que côté client
  useEffect(() => {
    window.dispatchEvent(new Event('cart-updated'));

    if (typeof window !== 'undefined') {
      let stored = getAppDataKey('products');
      if (!stored) {
        import('../../data/products').then(mod => {
          setAppDataKey('products', mod.products);
          setProducts(mod.products);
        });
      } else {
        setProducts(stored);
      }
    }
    
    // Récupérer les catégories depuis l'API
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Le nom de la catégorie est requis');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name.trim(),
          icon: newCategory.icon.trim() || null
        }),
      });

      if (response.ok) {
        const addedCategory = await response.json();
        setCategories(prev => [...prev, addedCategory]);
        setNewCategory({ name: '', icon: '' });
        setShowAddCategoryModal(false);
        
        // Sélectionner automatiquement la nouvelle catégorie dans le select
        const categorySelect = document.querySelector('select[name="category"]');
        if (categorySelect) {
          categorySelect.value = addedCategory.name;
        }
      } else {
        alert('Erreur lors de la création de la catégorie');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Erreur lors de la création de la catégorie');
    }
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const handleValidate = async () => {
    if (cart.length === 0) {
      setNotif("Votre panier est vide.");
      return;
    }
    setIsLoading(true);
    try {
      const userPseudo = getAppDataKey("userPseudo");
      const tableNumber = getAppDataKey("tableNumber");
      // Construction du payload pour Prisma
      const payload = {
        client: userPseudo,
        table: tableNumber,
        status: "En cours",
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      };
      console.log("[handleValidate] Payload:", payload);
      // Création côté Prisma
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        setNotif("Erreur lors de la validation de la commande.");
        console.error("[handleValidate] POST /api/orders failed", res.status);
        return;
      }
      const createdOrder = await res.json();
      console.log("[handleValidate] Order created:", createdOrder);
      // Recharge la liste depuis Prisma
      const ordersRes = await fetch("/api/orders");
      if (!ordersRes.ok) {
        setNotif("Erreur lors de la récupération des commandes.");
        console.error("[handleValidate] GET /api/orders failed", ordersRes.status);
        return;
      }
      let prismaOrders = await ordersRes.json();
      prismaOrders = prismaOrders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      

      setAppDataKey("orders", prismaOrders);
      setAppDataKey("cart", []);
      setCart([]);
      setQuantities({});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
        window.dispatchEvent(new Event('orders-updated'));
      }
      setOrderSent(true);
      setNotif("Commande validée avec succès !");
    } catch (err) {
      setNotif("Erreur inattendue lors de la validation de la commande.");
      console.error("[handleValidate] Unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      return getAppDataKey("cart") || [];
    }
    return [];
  });

  // Synchronisation automatique du panier sur 'cart-updated'
  useEffect(() => {
    function onCartUpdated() {
      setCart(getAppDataKey("cart") || []);
    }
    window.addEventListener('cart-updated', onCartUpdated);
    return () => window.removeEventListener('cart-updated', onCartUpdated);
  }, []);

  // Synchronise les quantités à chaque changement de cart
  useEffect(() => {
    const q = {};
    cart.forEach(item => {
      q[item.id] = item.quantity || 1;
    });
    setQuantities(q);
  }, [cart]);
  const [notif, setNotif] = useState("");
  const [categoryFilter, setCategoryFilter] = useState('Tous');

  const handleSub = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx === -1) return prev;
      let updated;
      if ((prev[idx].quantity || 1) > 1) {
        updated = prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        updated = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      }
      if (typeof window !== "undefined") {
        setAppDataKey("cart", updated);
        window.dispatchEvent(new Event('cart-updated'));
      }
      return updated;
    });
    setNotif(`1 ${product.name} retiré du panier !`);
  };

  const handleAdd = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex(item => item.id === product.id);
      let updated;
      if (idx === -1) {
        updated = [...prev, { ...product, quantity: 1 }];
      } else {
        updated = prev.map((item, i) =>
          i === idx ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      if (typeof window !== "undefined") {
        setAppDataKey("cart", updated);
        window.dispatchEvent(new Event('cart-updated'));
      }
      return updated;
    });
    setNotif(`${product.name} ajouté au panier !`);
  };

  const handleRemove = (idx) => {
    setCart((prev) => {
      const removed = prev[idx];
      const updated = prev.filter((_, i) => i !== idx);
      if (typeof window !== "undefined") {
        setAppDataKey("cart", updated);
        window.dispatchEvent(new Event('cart-updated'));
      }
      // Update quantities
      if (removed) {
        setQuantities(q => {
          const nq = { ...q };
          nq[removed.id] = Math.max((nq[removed.id] || 1) - 1, 0);
          if (nq[removed.id] === 0) delete nq[removed.id];
          return nq;
        });
      }
      return updated;
    });
  };

  const pathname = usePathname();
  const router = useRouter();
  // On veut afficher la modal pour toutes les sous-pages de /menu sauf /menu lui-même
  const isModal = pathname && pathname.startsWith('/menu/') && pathname !== '/menu';

  { products.sort((a, b) => a.category.localeCompare(b.category)) }


  // Détection admin
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = getAppDataKey('role');
      setIsAdmin(role === 'admin');
    }
  }, []);

  // Handlers CRUD produits
  const handleDeleteProduct = (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    setAppDataKey('products', newProducts);
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
      <ActionHeader 
        handleValidate={handleValidate} 
        isLoading={isLoading} 
        onFilterToggle={toggleFilter} 
        filterVisible={filterVisible}
        cart={cart}
      />
      <main className="menuLayout">
        <Notification message={notif} onClose={() => setNotif("")} />

        <section className="menuLayout__menu">
            <ul className={`categoryFilter categoryFilter--vertical${filterVisible ? ' categoryFilter--mobile-visible' : ''}`}>
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
            const quantity = quantities[prod.id] || 0;
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
                <form className="productForm">
                  <label>
                    Nom du produit
                    <input className="productForm__input" name="name" type="text" defaultValue={editProduct?.name || ''} required />
                  </label>
                  <label>
                    Description
                    <textarea className="productForm__input productForm__input--textarea" name="description" defaultValue={editProduct?.description || ''} />
                  </label>
                  <label>
                    Prix (€)
                    <input className="productForm__input" name="price" type="number" step="0.01" min="0" defaultValue={editProduct?.price || ''} required />
                  </label>
                  <label>
                    Catégorie
                    <select className="productForm__input" name="category" required defaultValue={editProduct?.category || ''}>
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      onClick={() => setShowAddCategoryModal(true)}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: '#666'
                      }}
                    >
                      + Créer une nouvelle catégorie
                    </button>
                  </label>
                  <label>
                    URL de l'image
                    <input className="productForm__input" name="image" type="text" defaultValue={editProduct?.image || ''} />
                  </label>
                  <label className="productForm__checkboxWrapper">
                    <input className="productForm__checkbox" name="customizable" type="checkbox" defaultChecked={!!editProduct?.customizable} /> Customisable
                  </label>
                  <label className="productForm__checkboxWrapper">
                    <input className="productForm__checkbox" name="status" type="checkbox" defaultChecked={editProduct?.status !== false} /> Actif (affiché)
                  </label>
                  <div className="productForm__actions">
                    <button className="productForm__submit" type="submit">Enregistrer</button>
                    <button className="productForm__cancel" type="button" onClick={() => setShowEditModal(false)}>Annuler</button>
                  </div>
                </form>
              </div>
            </Modal>
          )}
        </ul>

      </main>
      <Modal open={isModal} onClose={() => router.push('/menu')}>
        {children}
      </Modal>
      
      {/* Modal pour créer une nouvelle catégorie */}
      {showAddCategoryModal && (
        <Modal open={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)}>
          <div style={{ minWidth: 300, padding: 20 }}>
            <h2>Créer une nouvelle catégorie</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>
                Nom de la catégorie *
                <input 
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Entrées, Plats, Desserts..."
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    marginTop: 4
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>
                Icône (optionnel)
                <input 
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Ex: 🍜, 🍰, 🥗..."
                  style={{
                    width: '100%',
                    padding: 8,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    marginTop: 4
                  }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategory.name.trim()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: newCategory.name.trim() ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: newCategory.name.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}
      
      <Confetti trigger={orderSent} />
    </>
  );
}

// Main layout component with Suspense boundary
export default function MenuLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuLayoutContent>{children}</MenuLayoutContent>
    </Suspense>
  );
}
