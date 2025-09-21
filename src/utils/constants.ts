export const API_CONFIG = {
  BASE_URL: 'http://localhost:9000',
  PUBLISHABLE_KEY: 'pk_a765f901d115404d7c3e3aad73b65f2ce6131cbf73453afc39b882c7eb4cd8f6',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_2qqvb6DTqKondL46mnEjZ68e',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  IS_AUTHENTICATED: 'isAuthenticated',
  SELECTED_REGION_ID: 'selectedRegionId',
  CART_ID: 'cartId',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  TABS: '/tabs',
  TAB1: '/tabs/tab1',
  TAB2: '/tabs/tab2',
  TAB3: '/tabs/tab3',
  PRODUCT_DETAILS: '/tabs/product',
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 4000,
} as const;