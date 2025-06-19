import Image from "next/image";
import Link from "next/link";


const CATEGORY_FALLBACKS = {
  sushi: "/sushi/sushi_cat.png",
  maki: "/sushi/maki_cat.png",
  sashimi: "/sushi/sashimi_cat.png",
  california: "/sushi/california_cat.png",
  boisson: "/sushi/boisson_cat.png",
  dessert: "/sushi/desert_cat.png",
  entree: "/sushi/entree_cat.png",
};

import { useEffect, useState } from "react";

export default function ProductCard({ product, onAdd, onSub, isAdmin, onEdit, onDelete, quantity = 0, resetQuantities }) {
  // Stop propagation helper
  const stop = e => e.stopPropagation();

  const [displayQuantity, setDisplayQuantity] = useState(quantity);

  useEffect(() => {
    setDisplayQuantity(quantity);
  }, [quantity]);

  useEffect(() => {
    setDisplayQuantity(0);
  }, [resetQuantities]);

  return (
    <li className="productCard">
      <Link href={`/menu/${product.id}`} className="productCard__link" tabIndex={-1} style={{display: 'block'}}>
        <div className="productCard__main">
          <img src={product.image} alt={product.name} width={80} height={80} className="productCard__image"
            onError={e => { e.target.src = CATEGORY_FALLBACKS[product.category] }}
          />
          <article className="productCard__info">
            <h4 className="productCard__title">{product.name}</h4>
            <p className="productCard__desc">{product.description}</p>
            <div className="productCard__price">
              {product.price.toFixed(2)} €
            </div>
            {product.customizable && <span className="productCard__customizable">Customisable</span>}
          </article>
        </div>
      </Link>
      <section className="productCard__public">
        {/* <button className="productCard__add-btn" onClick={e => { stop(e); onAdd(product); }}>
          Ajouter
        </button> */}
        <section className="productCard__quantity">
          <button className="productCard__quantity-btn" onClick={e => { stop(e); onSub(product); }}>-</button>
          <span className="productCard__quantity-value">{displayQuantity}</span>
          <button className="productCard__quantity-btn" onClick={e => { stop(e); onAdd(product); }}>+</button>
        </section>
      </section>
      {isAdmin && (
        <div className="productCard__admin-actions">
          <button className="productCard__edit-btn" onClick={e => { stop(e); onEdit(product); }} title="Éditer">✏️</button>
          <button className="productCard__delete-btn" onClick={e => { stop(e); onDelete(product.id); }} title="Supprimer">🗑️</button>
        </div>
      )}
    </li>
  );
}

