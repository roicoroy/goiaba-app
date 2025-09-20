import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCreateCart, useMedusa } from 'medusa-react';
import { useRegionContext } from './RegionContext';

import { MedusaCart } from '../interfaces/medusa';

interface CartContextType {
  cart: MedusaCart | null;
  isLoading: boolean;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  cartItemCount: number;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { selectedRegion } = useRegionContext();
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<MedusaCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Medusa hooks and client
  const createCart = useCreateCart();
  const { client } = useMedusa();

  // Load cart ID from localStorage on mount
  useEffect(() => {
    const savedCartId = localStorage.getItem('cartId');
    if (savedCartId) {
      setCartId(savedCartId);
    }
  }, []);

  // Fetch cart data
  const fetchCart = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await client.carts.retrieve(id);
      setCart(response.cart);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart when cartId changes
  useEffect(() => {
    if (cartId) {
      fetchCart(cartId);
    }
  }, [cartId]);

  // Create new cart when region changes and no cart exists
  useEffect(() => {
    if (selectedRegion && !cartId) {
      createNewCart();
    }
  }, [selectedRegion, cartId]);

  const createNewCart = async () => {
    if (!selectedRegion) return;

    try {
      setError(null);
      const response = await createCart.mutateAsync({
        region_id: selectedRegion.id,
      });
      
      if (response.cart) {
        setCartId(response.cart.id);
        localStorage.setItem('cartId', response.cart.id);
      }
    } catch (err) {
      setError('Failed to create cart');
      console.error('Cart creation error:', err);
    }
  };

  const addToCart = async (variantId: string, quantity: number) => {
    if (!cartId) {
      await createNewCart();
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await client.carts.lineItems.create(cartId, {
        variant_id: variantId,
        quantity,
      });
      // Refresh cart data
      await fetchCart(cartId);
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', err);
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!cartId) return;

    try {
      setError(null);
      setIsLoading(true);
      await client.carts.lineItems.update(cartId, itemId, {
        quantity,
      });
      // Refresh cart data
      await fetchCart(cartId);
    } catch (err) {
      setError('Failed to update cart item');
      console.error('Update cart error:', err);
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!cartId) return;

    try {
      setError(null);
      setIsLoading(true);
      await client.carts.lineItems.delete(cartId, itemId);
      // Refresh cart data
      await fetchCart(cartId);
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Remove from cart error:', err);
      setIsLoading(false);
    }
  };

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const value: CartContextType = {
    cart,
    isLoading: isLoading || createCart.isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItemCount,
    error,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};