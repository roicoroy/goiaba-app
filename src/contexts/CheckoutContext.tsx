import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCartContext } from './CartContext';
import { useCustomerContext } from './CustomerContext';
import { useRegionContext } from './RegionContext';
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

interface PaymentProvider {
  id: string;
  is_enabled: boolean;
}

interface PaymentCollection {
  id: string;
  currency_code: string;
  amount: number;
  payment_sessions: PaymentSession[];
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
  paymentProviders: PaymentProvider[];
  selectedPaymentProvider: PaymentProvider | null;
  setSelectedPaymentProvider: (provider: PaymentProvider) => void;
  loadPaymentProviders: () => Promise<void>;
  
  paymentCollection: PaymentCollection | null;
  paymentSessions: PaymentSession[];
  selectedPaymentSession: PaymentSession | null;
  setSelectedPaymentSession: (session: PaymentSession) => void;
  createPaymentCollection: () => Promise<void>;
  createPaymentSession: (providerId: string) => Promise<void>;
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
  const { selectedRegion } = useRegionContext();
  const { client } = useMedusa();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<PaymentProvider | null>(null);
  const [paymentCollection, setPaymentCollection] = useState<PaymentCollection | null>(null);
  const [paymentSessions, setPaymentSessions] = useState<PaymentSession[]>([]);
  const [selectedPaymentSession, setSelectedPaymentSession] = useState<PaymentSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Add refs to track if operations are in progress
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

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

  const loadPaymentProviders = async () => {
    if (!selectedRegion?.id || isLoadingProviders) return;
    
    try {
      setIsLoadingProviders(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/store/payment-providers?region_id=${selectedRegion.id}`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load payment providers');
      }
      
      const data = await response.json();
      const enabledProviders = data.payment_providers.filter((provider: PaymentProvider) => provider.is_enabled);
      setPaymentProviders(enabledProviders);
      
      // Auto-select Stripe if available
      const stripeProvider = enabledProviders.find((provider: PaymentProvider) => 
        provider.id.includes('stripe')
      );
      if (stripeProvider) {
        setSelectedPaymentProvider(stripeProvider);
      } else if (enabledProviders.length > 0) {
        setSelectedPaymentProvider(enabledProviders[0]);
      }
    } catch (err) {
      console.error('Failed to load payment providers:', err);
      setError('Failed to load payment providers');
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const createPaymentCollection = async () => {
    if (!cart?.id || isCreatingCollection || paymentCollection) return;
    
    try {
      setIsCreatingCollection(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/store/payment-collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          cart_id: cart.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment collection');
      }
      
      const data = await response.json();
      setPaymentCollection(data.payment_collection);
    } catch (err) {
      console.error('Failed to create payment collection:', err);
      setError('Failed to create payment collection');
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const createPaymentSession = async (providerId: string) => {
    if (!paymentCollection?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/store/payment-collections/${paymentCollection.id}/payment-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          provider_id: providerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }
      
      const data = await response.json();
      setPaymentCollection(data.payment_collection);
      setPaymentSessions(data.payment_collection.payment_sessions || []);
      
      // Auto-select the created session
      if (data.payment_collection.payment_sessions?.length > 0) {
        setSelectedPaymentSession(data.payment_collection.payment_sessions[0]);
      }
    } catch (err) {
      console.error('Failed to create payment session:', err);
      setError('Failed to create payment session');
    } finally {
      setIsLoading(false);
    }
  };

  const initializePaymentSessions = async () => {
    if (!selectedRegion?.id) return;
    
    try {
      // Load payment providers first
      await loadPaymentProviders();
      
      // Create payment collection
      await createPaymentCollection();
    } catch (err) {
      console.error('Failed to initialize payment sessions:', err);
      setError('Failed to initialize payment');
    }
  };

  // Auto-create payment session when provider is selected
  useEffect(() => {
    if (selectedPaymentProvider && paymentCollection && !selectedPaymentSession && !isLoading) {
      createPaymentSession(selectedPaymentProvider.id);
    }
  }, [selectedPaymentProvider, paymentCollection, selectedPaymentSession, isLoading]);

  // Auto-load payment providers when region changes
  useEffect(() => {
    if (selectedRegion?.id && paymentProviders.length === 0 && !isLoadingProviders) {
      loadPaymentProviders();
    }
  }, [selectedRegion?.id, paymentProviders.length, isLoadingProviders]);

  // Auto-create payment collection when cart and providers are ready
  useEffect(() => {
    if (cart?.id && paymentProviders.length > 0 && !paymentCollection && !isCreatingCollection) {
      createPaymentCollection();
    }
  }, [cart?.id, paymentProviders.length, paymentCollection, isCreatingCollection]);

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
  }, [cart?.id, cart?.shipping_address?.id]);

  const value: CheckoutContextType = {
    currentStep,
    setCurrentStep,
    shippingMethods,
    selectedShippingMethod,
    setSelectedShippingMethod,
    loadShippingMethods,
    paymentProviders,
    selectedPaymentProvider,
    setSelectedPaymentProvider,
    loadPaymentProviders,
    paymentCollection,
    paymentSessions,
    selectedPaymentSession,
    setSelectedPaymentSession,
    createPaymentCollection,
    createPaymentSession,
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