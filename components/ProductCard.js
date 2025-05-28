import Image from "next/image";

export default function ProductCard({ product, onAdd }) {
  return (
    <div style={{border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fff', display: 'flex', alignItems: 'center', gap: 16}}>
      <Image src={product.image} alt={product.name} width={80} height={80} style={{borderRadius: 8}} />
      <div style={{flex: 1}}>
        <h4 style={{margin: 0}}>{product.name}</h4>
        <p style={{margin: '4px 0', color: '#666'}}>{product.description}</p>
        <div style={{fontWeight: 'bold', color: '#c0392b', marginBottom: 8}}>
          {product.price.toFixed(2)} €
        </div>
        {product.customizable && <span style={{fontSize: '0.8em', color: '#3498db'}}>Customisable</span>}
      </div>
      <button style={{background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => onAdd(product)}>
        Ajouter
      </button>
    </div>
  );
}
