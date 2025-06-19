// Page individuelle d'un produit (App Router Next.js)
import { notFound } from 'next/navigation';

async function getProduct(id) {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BASE_URL
      ? process.env.BASE_URL
      : 'http://localhost:3000';

  const res = await fetch(`${base}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }) {
  const { id } = params;
  const product = await getProduct(id);
  console.log(product);
  
  if (!product) return notFound();
  return (
    <div className="productPage">
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} style={{ maxWidth: 300, borderRadius: 12 }} />
      <p><strong>Description :</strong> {product.description}</p>
      <p><strong>Prix :</strong> {product.price} €</p>
      <p><strong>Catégorie :</strong> {product.category?.name}</p>
      <p><strong>Customisable :</strong> {product.customizable ? 'Oui' : 'Non'}</p>
      <p><strong>Status :</strong> {product.status ? 'Disponible' : 'Indisponible'}</p>
    </div>
  );
}
