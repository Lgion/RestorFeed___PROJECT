import Image from "next/image";

const CATEGORY_FALLBACKS = {
  sushi: "/sushi/sushi_cat.png",
  maki: "/sushi/maki_cat.png",
  sashimi: "/sushi/sashimi_cat.png",
  california: "/sushi/california_cat.png",
  boisson: "/sushi/boisson_cat.png",
  dessert: "/sushi/desert_cat.png",
  entree: "/sushi/entree_cat.png",
};

export default function ProductCard({ product, onAdd, onSub, isAdmin, onEdit, onDelete, quantity = 0 }) {
  
  
  return (
    <li className="productCard">
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
      <button className="productCard__add-btn" onClick={() => onAdd(product)}>
        Ajouter
      </button>
      <section className="productCard__quantity">
        <button className="productCard__quantity-btn" onClick={() => onSub({ ...product, quantity: product.quantity - 1 })}>-</button>
        <span className="productCard__quantity-value">{quantity}</span>
        <button className="productCard__quantity-btn" onClick={() => onAdd({ ...product, quantity: product.quantity + 1 })}>+</button>
      </section>

      {isAdmin && (
        <div className="productCard__admin-actions">
          <button className="productCard__edit-btn" onClick={() => onEdit(product)} title="Éditer">✏️</button>
          <button className="productCard__delete-btn" onClick={() => onDelete(product.id)} title="Supprimer">🗑️</button>
        </div>
      )}
    </li>
  );
}
