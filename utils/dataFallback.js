// Utilitaire pour fallback localStorage -> Prisma API
// Usage: getProductsWithFallback()

import { getAppDataKey, setAppDataKey } from "./localStorageApp";

export async function getProductsWithFallback() {
  // 1. Essayer localStorage (clé restOrFeed)
  let products = getAppDataKey("products");
  if (products && products.length) return products;

  // 2. Sinon, fallback sur l'API Prisma
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("API error");
    products = await res.json();
    if (Array.isArray(products)) {
      setAppDataKey("products", products); // on sauvegarde dans localStorage pour la prochaine fois
    }
    return products;
  } catch (e) {
    return [];
  }
}

export async function getCategoriesWithFallback() {
  let categories = getAppDataKey("categories");
  if (categories && categories.length) return categories;
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("API error");
    categories = await res.json();
    if (Array.isArray(categories)) {
      setAppDataKey("categories", categories);
    }
    return categories;
  } catch (e) {
    return [];
  }
}
