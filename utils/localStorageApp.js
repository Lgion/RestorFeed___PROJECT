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

// Initialize app data if not present
export function initializeAppData() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(APP_KEY)) {
    localStorage.setItem(APP_KEY, JSON.stringify(defaultAppData));
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
