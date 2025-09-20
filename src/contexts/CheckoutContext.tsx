import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCartContext } from './CartContext';
import { useCustomerContext } from './CustomerContext';
import { useMedusa } from 'medusa-react';
import { API_CONFIG } from '../utils/constants';

interface ShippingMethod {
  id: string;
  name: string;
  amount: number;
  currency_code: string;
}

interface PaymentSession {
  id: string;
  provider_id: string;
  amount: number;
  currency_code: string;
  data: any;
  status: string;
}

interface CheckoutContextType {
  // Checkout steps
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Shipping
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod | null;
  setSelectedShippingMethod: (method: ShippingMethod) => void;
  loadShippingMethods: () => Promise<void>;
  
  // Payment
  paymentSessions: PaymentSession[];
  selectedPaymentSession: PaymentSession | null;
  setSelectedPaymentSession: (session: PaymentSession) => void;
  initializePaymentSessions: () => Promise<void>;
  
  // Order completion
  completeOrder: () => Promise<{ order: any } | null>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Order result
  completedOrder: any | null;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const { cart } = useCartContext();
  const { customer } = useCustomerContext();
  const { client } = useMedusa();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [paymentSessions, setPaymentSessions] = useState<PaymentSession[]>([]);
  const [selectedPaymentSession, setSelectedPaymentSession] = useState<PaymentSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const loadShippingMethods = async () => {
    if (!cart?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await client.shippingOptions.listCartOptions(cart.id);
      setShippingMethods(response.shipping_options || []);
    } catch (err) {
      console.error('Failed to load shipping methods:', err);
      setError('Failed to load shipping methods');
    } finally {
      setIsLoading(false);
    }
  };

  const initializePaymentSessions = async () => {
    if (!cart?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize payment sessions
      const response = await client.carts.createPaymentSessions(cart.id);
      const sessions = response.cart.payment_sessions || [];
      setPaymentSessions(sessions);
      
      // Auto-select Stripe if available
      const stripeSession = sessions.find((session: PaymentSession) => 
        session.provider_id === 'stripe'
      );
      if (stripeSession) {
        setSelectedPaymentSession(stripeSession);
      }
    } catch (err) {
      console.error('Failed to initialize payment sessions:', err);
      setError('Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOrder = async () => {
    if (!cart?.id || !selectedPaymentSession) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Complete the cart to create an order
      const response = await client.carts.complete(cart.id);
      
      if (response.type === 'order') {
        setCompletedOrder(response.data);
        return { order: response.data };
      } else {
        throw new Error('Order completion failed');
      }
    } catch (err) {
      console.error('Failed to complete order:', err);
      setError('Failed to complete order');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load shipping methods when cart changes
  useEffect(() => {
    if (cart?.id && cart.shipping_address) {
      loadShippingMethods();
    }
  }, [cart?.id, cart?.shipping_address]);

  const value: CheckoutContextType = {
    currentStep,
    setCurrentStep,
    shippingMethods,
    selectedShippingMethod,
    setSelectedShippingMethod,
    loadShippingMethods,
    paymentSessions,
    selectedPaymentSession,
    setSelectedPaymentSession,
    initializePaymentSessions,
    completeOrder,
    isLoading,
    error,
    completedOrder,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider');
  }
  return context;
};