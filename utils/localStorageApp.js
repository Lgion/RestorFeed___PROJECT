// Centralized localStorage utility for RestOrFeed app

const APP_KEY = "restOrFeed";

// Default template for all app data
export const defaultAppData = {
  cart: [],
  orders: [], // Historique des commandes
  role: "public", // Rôle global éventuel
  user: {
    id: null,        // Prisma user id
    clerkId: null,   // Clerk user id
    email: null,     // Clerk email
    username: null,  // Optional username
    // role: null,      // Prisma role
  },
  settings: {}, // theme, language, etc.
  // Add other app-wide variables here
};

// Récupère les données utilisateur depuis Prisma
async function fetchUserFromPrisma(clerkId) {
  try {
    const response = await fetch(`/api/users/clerk/${clerkId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching user from Prisma:', error);
  }
  return null;
}

// Récupère les commandes depuis l'API
async function fetchOrders() {
  try {
    const response = await fetch('/api/orders');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
  return [];
}

// Initialise ou met à jour les données de l'application
export async function initializeAppData() {
  if (typeof window === "undefined") return;
  
  const existingData = localStorage.getItem(APP_KEY);
  
  // Si pas de données existantes, on essaie de les récupérer via Clerk
  if (!existingData) {
    try {
      // Récupère les commandes
      const orders = await fetchOrders();
      // Crée un nouvel objet avec les commandes récupérées
      const newData = {
        ...defaultAppData,
        orders: orders
      };
      
      // Vérifie si l'utilisateur est connecté via Clerk
      const clerkUser = window.Clerk?.user;
      if (clerkUser?.id) {
        // Récupère les données de Prisma
        const userData = await fetchUserFromPrisma(clerkUser.id);
        if (userData) {
          newData.user = {
            id: userData.id,
            clerkId: userData.clerkId,
            email: userData.email,
            username: userData.username,
            role: userData.role
          };
        }
      }
      
      // Met à jour le localStorage avec les données
      localStorage.setItem(APP_KEY, JSON.stringify(newData));
      return;
    } catch (error) {
      console.error('Error initializing app data:', error);
      localStorage.setItem(APP_KEY, JSON.stringify(defaultAppData));
    }
  } else {
    // Mise à jour des données existantes si nécessaire
    try {
      const currentData = JSON.parse(existingData);
      // Récupère les commandes
      const orders = await fetchOrders();
      const updatedData = {
        ...currentData,
        orders: orders
      };
      
      if (currentData.user?.clerkId) {
        const userData = await fetchUserFromPrisma(currentData.user.clerkId);
        if (userData) {
          updatedData.user = {
            ...currentData.user,
            email: userData.email || currentData.user.email,
            username: userData.username || currentData.user.username,
            role: userData.role || currentData.user.role
          };
        }
      }
      
      localStorage.setItem(APP_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error updating app data:', error);
    }
  }
}

// Get the whole app data object
export function getAppData() {
  if (typeof window === "undefined") return defaultAppData;
  const raw = localStorage.getItem(APP_KEY);
  if (!raw) return defaultAppData;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultAppData;
  }
}

// Set the whole app data object
export function setAppData(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_KEY, JSON.stringify(data));
}

// Get a value by key (e.g. "cart")
export function getAppDataKey(key) {
  const data = getAppData();
  return data[key];
}

// Set a value by key (e.g. "cart")
export function setAppDataKey(key, value) {
  const data = getAppData();
  data[key] = value;
  setAppData(data);
}

// Utility for nested path (e.g. "settings.theme")
export function getGlobalItem(path) {
  const data = getAppData();
  return path.split('.').reduce((acc, part) => acc && acc[part], data);
}

export function setGlobalItem(path, value) {
  const data = getAppData();
  const parts = path.split('.');
  let obj = data;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
  setAppData(data);
}
