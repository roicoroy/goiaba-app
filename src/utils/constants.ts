export const API_CONFIG = {
  BASE_URL: 'http://localhost:9000',
  PUBLISHABLE_KEY: 'pk_ab18936f73e3e8ccbe247b44861e58684ca46c79aaaa8bb38beab5766012563c',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51Pzad704q0B7q2wz8zASldczqkHqbIvXsB2DBO20OEkAC9q7RUvoiBcZ9NVOakZMTWtg2vxgcJQN0mUpXtrThg2D00fHtuTwvj',
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