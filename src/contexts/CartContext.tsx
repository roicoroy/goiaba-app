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
      
      // If the cart is found and returned, set it.
      if (response && response.cart) {
        setCart(response.cart);
      } else {
        // If the cart is not found (response.cart is falsy), clear the invalid ID.
        console.warn("Cart not found on server. Clearing local cart ID.");
        setCartId(null);
        setCart(null);
        localStorage.removeItem('cartId');
        setError('Failed to load cart: Not found.');
      }
    } catch (err: any) { 
      // Fallback for any other unexpected errors during fetch.
      console.error('An unexpected error occurred while fetching the cart:', err);
      setError('Failed to load cart.');
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

  const createNewCart = async (): Promise<string | null> => {
    console.log("Attempting to create new cart.");
    if (!selectedRegion) {
      console.error("Cannot create cart: No selected region.");
      return null;
    }
    console.log("Creating cart for region:", selectedRegion.name);

    try {
      setError(null);
      const { cart: newCart } = await createCart.mutateAsync({
        region_id: selectedRegion.id,
      });
      
      if (newCart) {
        console.log("Successfully created new cart with ID:", newCart.id);
        setCartId(newCart.id);
        localStorage.setItem('cartId', newCart.id);
        return newCart.id;
      }
      console.warn("Cart creation returned no cart object.");
      return null;
    } catch (err) {
      setError('Failed to create cart');
      console.error('Cart creation error:', err);
      return null;
    }
  };

  const addToCart = async (variantId: string, quantity: number) => {
    console.log("--- Add To Cart Fired ---");
    console.log("Initial cartId:", cartId);
    setIsLoading(true);
    setError(null);

    try {
      // Ensure we have a cart ID. If not, create a new cart and get its ID.
      let currentCartId = cartId;
      if (!currentCartId) {
        console.log("No cartId found, calling createNewCart...");
        currentCartId = await createNewCart();
        console.log("createNewCart returned ID:", currentCartId);
      }

      if (!currentCartId) {
        throw new Error("Could not create or retrieve cart.");
      }
      console.log(`Using cartId: ${currentCartId} to add item.`);

      // Add the item to the cart.
      await client.carts.lineItems.create(currentCartId, {
        variant_id: variantId,
        quantity,
      });
      console.log("Successfully added line item.");

      // Refresh cart data to reflect the new item.
      console.log("Refreshing cart data...");
      await fetchCart(currentCartId);
      console.log("Cart data refreshed.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to add item to cart: ${errorMessage}`);
      console.error('Add to cart error:', err);
    } finally {
      setIsLoading(false);
      console.log("--- Add To Cart Finished ---");
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

  const refreshCart = async () => {
    if (cartId) {
      await fetchCart(cartId);
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
    refreshCart,
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